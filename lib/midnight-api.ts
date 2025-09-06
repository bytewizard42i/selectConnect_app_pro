/**
 * Midnight Network API Integration for SelectConnect Protocol
 * Provides type-safe interfaces for interacting with Midnight's ZK proof system
 */

import { MidnightProvider, Contract, Signer } from '@midnight-ntwrk/midnight-js-sdk';
import { ProofRequest, ProofResponse, Circuit } from './types/midnight-types';

/**
 * Midnight API Client for SelectConnect
 * Handles proof generation, contract deployment, and transaction submission
 */
export class MidnightAPI {
  private provider: MidnightProvider;
  private proofServerUrl: string;
  private contractAddress?: string;
  private signer?: Signer;

  constructor(
    providerUrl: string = 'ws://localhost:9944',
    proofServer: string = 'http://localhost:6300'
  ) {
    this.provider = new MidnightProvider(providerUrl);
    this.proofServerUrl = proofServer;
  }

  /**
   * Initialize connection with wallet
   */
  async connect(): Promise<void> {
    this.signer = await this.provider.getSigner();
    console.log('Connected to Midnight Network:', await this.signer.getAddress());
  }

  /**
   * Deploy SelectConnect Protocol contract
   */
  async deployContract(
    contractPath: string,
    constructorArgs: any[] = []
  ): Promise<string> {
    if (!this.signer) throw new Error('Not connected to wallet');

    // Compile contract
    const compiledContract = await this.compileContract(contractPath);
    
    // Generate deployment proof
    const deploymentProof = await this.generateProof('deploy', {
      contract: compiledContract,
      args: constructorArgs
    });

    // Submit deployment transaction
    const tx = await this.provider.submitTransaction({
      type: 'deploy',
      proof: deploymentProof,
      data: compiledContract
    });

    this.contractAddress = tx.contractAddress;
    return tx.contractAddress;
  }

  /**
   * Compile Compact contract
   */
  async compileContract(contractPath: string): Promise<any> {
    const response = await fetch(`${this.proofServerUrl}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        path: contractPath,
        target: 'wasm',
        optimize: true
      })
    });

    if (!response.ok) {
      throw new Error(`Compilation failed: ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Generate zero-knowledge proof for circuit
   */
  async generateProof(
    circuitName: string, 
    witness: any
  ): Promise<ProofResponse> {
    const proofRequest: ProofRequest = {
      circuit: circuitName,
      witness: witness,
      publicInputs: this.extractPublicInputs(witness)
    };

    const response = await fetch(`${this.proofServerUrl}/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proofRequest)
    });

    if (!response.ok) {
      throw new Error(`Proof generation failed: ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Call SelectConnect contract circuit
   */
  async callCircuit(
    circuitName: string,
    args: any[]
  ): Promise<any> {
    if (!this.contractAddress) {
      throw new Error('Contract not deployed');
    }

    const contract = await this.provider.getContract(this.contractAddress);
    
    // Generate witness data
    const witness = this.prepareWitness(circuitName, args);
    
    // Generate proof
    const proof = await this.generateProof(circuitName, witness);
    
    // Submit transaction with proof
    const tx = await contract.call(circuitName, {
      proof: proof.proof,
      publicInputs: proof.publicInputs
    });

    return tx;
  }

  /**
   * Create SelectConnect card with privacy features
   */
  async createCard(params: {
    aliasHash: string;
    requiresBond: boolean;
    minBondAmount: bigint;
    defaultTTL: bigint;
    phoneCommit: string;
    emailCommit: string;
  }): Promise<string> {
    const witness = {
      adminSecret: await this.generateSecret(),
      randomValue: await this.generateRandom(),
      ...params
    };

    const result = await this.callCircuit('createCard', [witness]);
    return result.cardId;
  }

  /**
   * Generate privacy route (5-digit code)
   */
  async generatePrivacyRoute(params: {
    cardId: string;
    privacyLevel: number;
    ttl: bigint;
    isTrackable: boolean;
  }): Promise<string> {
    const witness = {
      adminSecret: await this.getAdminSecret(),
      randomValue: await this.generateRandom(),
      currentTimestamp: BigInt(Date.now() / 1000),
      ...params
    };

    const result = await this.callCircuit('generatePrivacyRoute', [witness]);
    
    // Convert to 5-digit code
    const routeCode = this.formatRouteCode(result.routeCode);
    console.log(`Generated privacy route: ${routeCode}`);
    
    return routeCode;
  }

  /**
   * Post abuse bond for contacting card holder
   */
  async postBond(params: {
    cardId: string;
    amount: bigint;
    ttl: bigint;
  }): Promise<string> {
    const witness = {
      senderSecret: await this.generateSecret(),
      currentTimestamp: BigInt(Date.now() / 1000),
      ...params
    };

    const result = await this.callCircuit('postBond', [witness]);
    return result.bondId;
  }

  /**
   * Access card via privacy route
   */
  async accessViaPrivacyRoute(
    routeCode: string,
    senderCommit: string
  ): Promise<{
    cardId: string;
    privacyLevel: number;
    isTrackable: boolean;
  }> {
    const witness = {
      randomValue: await this.generateRandom(),
      currentTimestamp: BigInt(Date.now() / 1000)
    };

    return this.callCircuit('accessViaPrivacyRoute', [
      this.parseRouteCode(routeCode),
      senderCommit,
      witness
    ]);
  }

  /**
   * Progressive reveal - access next level
   */
  async accessNextLevel(
    linkId: string,
    levelData: string
  ): Promise<string> {
    const witness = {
      recipientSecret: await this.getRecipientSecret(),
      randomValue: await this.generateRandom(),
      currentTimestamp: BigInt(Date.now() / 1000)
    };

    const result = await this.callCircuit('accessNextLevel', [
      linkId,
      levelData,
      witness
    ]);

    return result.revealedData;
  }

  /**
   * Helper: Extract public inputs from witness
   */
  private extractPublicInputs(witness: any): any[] {
    // Filter out private witness fields
    const privateFields = ['adminSecret', 'senderSecret', 'recipientSecret', 'randomValue'];
    const publicInputs: any[] = [];
    
    for (const [key, value] of Object.entries(witness)) {
      if (!privateFields.includes(key)) {
        publicInputs.push(value);
      }
    }
    
    return publicInputs;
  }

  /**
   * Helper: Prepare witness data for circuit
   */
  private prepareWitness(circuitName: string, args: any[]): any {
    // Circuit-specific witness preparation
    const witnessMap: Record<string, any> = {
      createCard: {
        adminSecret: () => this.generateSecret(),
        randomValue: () => this.generateRandom()
      },
      postBond: {
        senderSecret: () => this.generateSecret(),
        currentTimestamp: () => BigInt(Date.now() / 1000)
      },
      generatePrivacyRoute: {
        adminSecret: () => this.getAdminSecret(),
        randomValue: () => this.generateRandom(),
        currentTimestamp: () => BigInt(Date.now() / 1000)
      }
    };

    const baseWitness = witnessMap[circuitName] || {};
    const witness: any = {};

    // Execute witness functions
    for (const [key, value] of Object.entries(baseWitness)) {
      witness[key] = typeof value === 'function' ? value() : value;
    }

    // Merge with provided arguments
    return { ...witness, ...args[0] };
  }

  /**
   * Generate cryptographic secret
   */
  private async generateSecret(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return '0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate random value for commitments
   */
  private async generateRandom(): Promise<string> {
    return this.generateSecret();
  }

  /**
   * Get stored admin secret
   */
  private async getAdminSecret(): Promise<string> {
    // In production, retrieve from secure storage
    const stored = localStorage.getItem('selectconnect_admin_secret');
    if (!stored) {
      const secret = await this.generateSecret();
      localStorage.setItem('selectconnect_admin_secret', secret);
      return secret;
    }
    return stored;
  }

  /**
   * Get recipient secret
   */
  private async getRecipientSecret(): Promise<string> {
    const stored = localStorage.getItem('selectconnect_recipient_secret');
    if (!stored) {
      const secret = await this.generateSecret();
      localStorage.setItem('selectconnect_recipient_secret', secret);
      return secret;
    }
    return stored;
  }

  /**
   * Format route code as 5-digit string
   */
  private formatRouteCode(routeCode: string): string {
    // Extract last 5 digits from hash
    const num = BigInt(routeCode) % 90000n + 10000n;
    return num.toString();
  }

  /**
   * Parse 5-digit route code back to bytes32
   */
  private parseRouteCode(routeCode: string): string {
    // This would need to lookup the actual route code from storage
    // For now, return padded version
    const num = BigInt(routeCode);
    return '0x' + num.toString(16).padStart(64, '0');
  }

  /**
   * Monitor proof generation metrics
   */
  async getMetrics(): Promise<any> {
    const response = await fetch(`${this.proofServerUrl.replace('6300', '6301')}/metrics`);
    return response.text();
  }

  /**
   * Health check for proof server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.proofServerUrl.replace('6300', '6301')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const midnightAPI = new MidnightAPI(
  process.env.MIDNIGHT_RPC_URL || 'ws://localhost:9944',
  process.env.PROOF_SERVER_URL || 'http://localhost:6300'
);
