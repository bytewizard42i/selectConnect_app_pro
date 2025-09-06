/**
 * Mesh.js Connector for SelectConnect Protocol
 * Bridges Midnight Network with Cardano for cross-chain functionality
 */

import { 
  MeshWallet, 
  Transaction, 
  KoiosProvider,
  BlockfrostProvider,
  UTxO,
  Asset,
  Recipient
} from '@meshsdk/core';
import { MidnightAPI } from './midnight-api';

/**
 * Mesh-Midnight Bridge for cross-chain operations
 * Enables ADA bond staking and cross-chain verification
 */
export class MeshMidnightBridge {
  private meshWallet?: MeshWallet;
  private provider: KoiosProvider | BlockfrostProvider;
  private midnightAPI: MidnightAPI;
  private bondEscrowAddress?: string;

  constructor(
    providerType: 'koios' | 'blockfrost' = 'koios',
    apiKey?: string
  ) {
    // Initialize Cardano provider
    this.provider = providerType === 'blockfrost' 
      ? new BlockfrostProvider(apiKey!)
      : new KoiosProvider('preprod');
    
    // Initialize Midnight API
    this.midnightAPI = new MidnightAPI();
  }

  /**
   * Connect to Cardano wallet
   */
  async connectWallet(walletName: string = 'nami'): Promise<void> {
    const walletApi = await window.cardano[walletName].enable();
    this.meshWallet = new MeshWallet({
      networkId: 0, // Preprod
      fetcher: this.provider,
      submitter: this.provider,
      key: {
        type: 'root',
        bech32: await walletApi.getChangeAddress()
      }
    });

    console.log('Connected to Cardano wallet:', await this.getWalletAddress());
  }

  /**
   * Post ADA bond for SelectConnect contact
   * Locks ADA on Cardano and generates proof on Midnight
   */
  async postADABond(params: {
    cardId: string;
    amountADA: number;
    ttlSeconds: number;
  }): Promise<{
    cardanoTxHash: string;
    midnightBondId: string;
  }> {
    if (!this.meshWallet) throw new Error('Wallet not connected');

    // Step 1: Lock ADA in Cardano escrow contract
    const cardanoTx = await this.lockADAInEscrow({
      amount: params.amountADA,
      metadata: {
        selectConnectCardId: params.cardId,
        ttl: params.ttlSeconds,
        timestamp: Date.now()
      }
    });

    // Step 2: Generate proof of ADA lock for Midnight
    const lockProof = await this.generateLockProof(cardanoTx);

    // Step 3: Post bond on Midnight with Cardano proof
    const midnightBondId = await this.midnightAPI.postBond({
      cardId: params.cardId,
      amount: BigInt(params.amountADA * 1_000_000), // Convert to lovelace
      ttl: BigInt(params.ttlSeconds)
    });

    // Step 4: Store cross-chain reference
    await this.storeCrossChainReference({
      cardanoTxHash: cardanoTx,
      midnightBondId: midnightBondId,
      cardId: params.cardId
    });

    return {
      cardanoTxHash: cardanoTx,
      midnightBondId: midnightBondId
    };
  }

  /**
   * Lock ADA in Cardano escrow smart contract
   */
  private async lockADAInEscrow(params: {
    amount: number;
    metadata: any;
  }): Promise<string> {
    if (!this.meshWallet) throw new Error('Wallet not connected');

    const tx = new Transaction({ initiator: this.meshWallet });

    // Add escrow output with datum
    tx.sendLovelace(
      {
        address: this.getEscrowAddress(),
        datum: {
          value: this.buildEscrowDatum(params.metadata),
          inline: true
        }
      },
      (params.amount * 1_000_000).toString()
    );

    // Add metadata for tracking
    tx.setMetadata(674, params.metadata);

    // Build and sign transaction
    const unsignedTx = await tx.build();
    const signedTx = await this.meshWallet.signTx(unsignedTx);
    const txHash = await this.meshWallet.submitTx(signedTx);

    console.log('ADA locked in escrow:', txHash);
    return txHash;
  }

  /**
   * Refund ADA bond after successful interaction
   */
  async refundBond(
    bondId: string,
    cardanoTxHash: string
  ): Promise<string> {
    if (!this.meshWallet) throw new Error('Wallet not connected');

    // Step 1: Get refund approval from Midnight
    const refundProof = await this.midnightAPI.callCircuit('refundBond', [{
      bondId: bondId,
      currentTimestamp: BigInt(Date.now() / 1000)
    }]);

    // Step 2: Build Cardano refund transaction
    const tx = new Transaction({ initiator: this.meshWallet });

    // Find and spend the locked UTxO
    const lockedUtxo = await this.findLockedUTxO(cardanoTxHash);
    if (!lockedUtxo) throw new Error('Locked UTxO not found');

    tx.spendingPlutusScriptV2()
      .txIn(
        lockedUtxo.input.txHash,
        lockedUtxo.input.outputIndex
      )
      .txInInlineDatumPresent()
      .txInRedeemerValue({
        data: {
          alternative: 0, // Refund action
          fields: [refundProof]
        }
      })
      .spendingTxInReference(
        this.getEscrowScriptRef().txHash,
        this.getEscrowScriptRef().outputIndex
      );

    // Send refund to original sender
    tx.sendLovelace(
      await this.getWalletAddress(),
      lockedUtxo.output.amount[0].quantity
    );

    // Build, sign and submit
    const unsignedTx = await tx.build();
    const signedTx = await this.meshWallet.signTx(unsignedTx);
    const txHash = await this.meshWallet.submitTx(signedTx);

    console.log('Bond refunded:', txHash);
    return txHash;
  }

  /**
   * Slash bond for abuse (admin only)
   */
  async slashBond(
    bondId: string,
    cardanoTxHash: string,
    evidenceHash: string
  ): Promise<string> {
    if (!this.meshWallet) throw new Error('Wallet not connected');

    // Step 1: Get slash authorization from Midnight
    const slashProof = await this.midnightAPI.callCircuit('slashBond', [{
      bondId: bondId,
      evidenceHash: evidenceHash,
      currentTimestamp: BigInt(Date.now() / 1000)
    }]);

    // Step 2: Build Cardano slash transaction
    const tx = new Transaction({ initiator: this.meshWallet });

    const lockedUtxo = await this.findLockedUTxO(cardanoTxHash);
    if (!lockedUtxo) throw new Error('Locked UTxO not found');

    tx.spendingPlutusScriptV2()
      .txIn(
        lockedUtxo.input.txHash,
        lockedUtxo.input.outputIndex
      )
      .txInInlineDatumPresent()
      .txInRedeemerValue({
        data: {
          alternative: 1, // Slash action
          fields: [slashProof, evidenceHash]
        }
      })
      .spendingTxInReference(
        this.getEscrowScriptRef().txHash,
        this.getEscrowScriptRef().outputIndex
      );

    // Send slashed funds to safety pool
    const slashAmount = BigInt(lockedUtxo.output.amount[0].quantity);
    const halfToPool = slashAmount / 2n;
    const halfToBurn = slashAmount - halfToPool;

    tx.sendLovelace(
      this.getSafetyPoolAddress(),
      halfToPool.toString()
    );

    // Build, sign and submit
    const unsignedTx = await tx.build();
    const signedTx = await this.meshWallet.signTx(unsignedTx);
    const txHash = await this.meshWallet.submitTx(signedTx);

    console.log('Bond slashed:', txHash);
    return txHash;
  }

  /**
   * Monitor Cardano transactions for bond events
   */
  async monitorBondTransactions(
    cardId: string,
    callback: (event: BondEvent) => void
  ): Promise<void> {
    // Set up WebSocket for real-time monitoring
    const ws = new WebSocket('wss://ws.koios.rest/');
    
    ws.on('message', async (data: string) => {
      const event = JSON.parse(data);
      
      if (event.type === 'tx' && event.metadata?.selectConnectCardId === cardId) {
        // Parse bond event
        const bondEvent: BondEvent = {
          type: this.determineBondEventType(event),
          txHash: event.tx_hash,
          amount: event.value,
          timestamp: event.block_time,
          cardId: cardId
        };
        
        callback(bondEvent);
      }
    });

    // Subscribe to address events
    ws.send(JSON.stringify({
      type: 'subscribe',
      address: this.getEscrowAddress()
    }));
  }

  /**
   * Generate proof of ADA lock for Midnight
   */
  private async generateLockProof(txHash: string): Promise<string> {
    // Query transaction details
    const tx = await this.provider.fetchTxInfo(txHash);
    
    // Create Merkle proof of transaction inclusion
    const proof = {
      txHash: txHash,
      blockHash: tx.block,
      blockHeight: tx.block_height,
      outputIndex: 0,
      amount: tx.output_amount[0].quantity,
      datum: tx.data_hash
    };

    // Generate cryptographic proof
    return this.hashProof(proof);
  }

  /**
   * Build escrow datum for Cardano script
   */
  private buildEscrowDatum(metadata: any): string {
    return JSON.stringify({
      constructor: 0,
      fields: [
        { bytes: metadata.selectConnectCardId },
        { int: metadata.ttl },
        { int: metadata.timestamp }
      ]
    });
  }

  /**
   * Find locked UTxO by transaction hash
   */
  private async findLockedUTxO(txHash: string): Promise<UTxO | null> {
    const utxos = await this.provider.fetchAddressUTxOs(
      this.getEscrowAddress()
    );

    return utxos.find(utxo => utxo.input.txHash === txHash) || null;
  }

  /**
   * Store cross-chain reference for tracking
   */
  private async storeCrossChainReference(params: {
    cardanoTxHash: string;
    midnightBondId: string;
    cardId: string;
  }): Promise<void> {
    // Store in IndexedDB for persistence
    const db = await this.openDatabase();
    const tx = db.transaction(['bonds'], 'readwrite');
    
    await tx.objectStore('bonds').add({
      ...params,
      timestamp: Date.now(),
      status: 'active'
    });
  }

  /**
   * Open IndexedDB for cross-chain tracking
   */
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SelectConnectBridge', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('bonds')) {
          const store = db.createObjectStore('bonds', { 
            keyPath: 'midnightBondId' 
          });
          store.createIndex('cardanoTxHash', 'cardanoTxHash', { unique: true });
          store.createIndex('cardId', 'cardId', { unique: false });
        }
      };
    });
  }

  /**
   * Helper: Get wallet address
   */
  private async getWalletAddress(): Promise<string> {
    if (!this.meshWallet) throw new Error('Wallet not connected');
    const addresses = await this.meshWallet.getUsedAddresses();
    return addresses[0];
  }

  /**
   * Helper: Get escrow contract address
   */
  private getEscrowAddress(): string {
    return process.env.NEXT_PUBLIC_ESCROW_ADDRESS || 
      'addr_test1wzn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uwc5lpd8j';
  }

  /**
   * Helper: Get safety pool address
   */
  private getSafetyPoolAddress(): string {
    return process.env.NEXT_PUBLIC_SAFETY_POOL_ADDRESS ||
      'addr_test1wqag3rt979nep9g2wtdwu8mr4gz6m4kjdpp37wx8pnh8dqqz8m8hd';
  }

  /**
   * Helper: Get escrow script reference
   */
  private getEscrowScriptRef(): { txHash: string; outputIndex: number } {
    return {
      txHash: process.env.NEXT_PUBLIC_ESCROW_SCRIPT_TX || '',
      outputIndex: 0
    };
  }

  /**
   * Helper: Hash proof data
   */
  private hashProof(proof: any): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(proof));
    return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Helper: Determine bond event type
   */
  private determineBondEventType(event: any): 'posted' | 'refunded' | 'slashed' {
    if (event.metadata?.action === 'refund') return 'refunded';
    if (event.metadata?.action === 'slash') return 'slashed';
    return 'posted';
  }
}

/**
 * Bond event interface
 */
interface BondEvent {
  type: 'posted' | 'refunded' | 'slashed';
  txHash: string;
  amount: string;
  timestamp: number;
  cardId: string;
}

// Export singleton instance
export const meshBridge = new MeshMidnightBridge('koios');
