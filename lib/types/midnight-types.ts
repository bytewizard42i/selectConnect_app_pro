/**
 * TypeScript Type Definitions for Midnight Network Integration
 * Compatible with Compact v0.16 and Midnight SDK
 */

// Core Midnight types
export interface MidnightProvider {
  getContract(address: string): Promise<Contract>;
  getSigner(): Promise<Signer>;
  submitTransaction(tx: Transaction): Promise<TransactionReceipt>;
  getBalance(address: string): Promise<string>;
  getTransaction(txHash: string): Promise<Transaction>;
}

export interface Signer {
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>;
  signTransaction(tx: Transaction): Promise<SignedTransaction>;
}

export interface Contract {
  address: string;
  call(method: string, params: any): Promise<any>;
  estimateGas(method: string, params: any): Promise<bigint>;
}

// Proof types
export interface ProofRequest {
  circuit: string;
  witness: WitnessData;
  publicInputs?: any[];
}

export interface ProofResponse {
  proof: ZKProof;
  publicInputs: any[];
  verificationKey: string;
}

export interface ZKProof {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
  protocol: string;
  curve: string;
}

export interface WitnessData {
  [key: string]: any;
  adminSecret?: string;
  senderSecret?: string;
  recipientSecret?: string;
  randomValue?: string;
  currentTimestamp?: bigint;
}

// Transaction types
export interface Transaction {
  type: 'deploy' | 'call' | 'transfer';
  from?: string;
  to?: string;
  value?: bigint;
  data?: string;
  proof?: ZKProof;
  gasLimit?: bigint;
  nonce?: number;
}

export interface SignedTransaction extends Transaction {
  signature: string;
  hash: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to?: string;
  contractAddress?: string;
  status: boolean;
  gasUsed: bigint;
  logs: Log[];
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

// Circuit compilation types
export interface Circuit {
  name: string;
  abi: CircuitABI;
  bytecode: string;
  verificationKey: string;
}

export interface CircuitABI {
  inputs: CircuitInput[];
  outputs: CircuitOutput[];
  witnesses: WitnessField[];
}

export interface CircuitInput {
  name: string;
  type: CompactType;
  public: boolean;
}

export interface CircuitOutput {
  name: string;
  type: CompactType;
}

export interface WitnessField {
  name: string;
  type: CompactType;
  description?: string;
}

// Compact language types
export type CompactType = 
  | 'Bytes<32>'
  | 'Uint<64>'
  | 'Uint<32>'
  | 'Uint<8>'
  | 'Boolean'
  | 'Field'
  | 'Counter'
  | `Vector<${number}, ${CompactType}>`
  | `Map<${CompactType}, ${CompactType}>`
  | `Set<${CompactType}>`
  | `MerkleTree<${number}, ${CompactType}>`
  | `Opaque<'${string}'>`;

// SelectConnect specific types
export enum CardState {
  UNSET = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
  REVOKED = 3
}

export enum CredentialState {
  NONE = 0,
  ISSUED = 1,
  REVOKED = 2
}

export enum BondState {
  ACTIVE = 0,
  REFUNDED = 1,
  SLASHED = 2
}

export enum PrivacyLevel {
  Company = 0,
  Personal = 1,
  Both = 2,
  Trusted = 3,
  Custom = 4
}

export enum InteractionType {
  Initial = 0,
  Follow_up = 1,
  Spam_reported = 2
}

// SelectConnect data structures
export interface SelectConnectCard {
  cardId: string;
  adminId: string;
  state: CardState;
  aliasHash: string;
  requiresBond: boolean;
  minBondAmount: bigint;
  defaultTTL: bigint;
  revealDelay: bigint;
  phoneCommit: string;
  emailCommit: string;
}

export interface Bond {
  bondId: string;
  cardId: string;
  senderCommit: string;
  amount: bigint;
  postedAt: bigint;
  expiresAt: bigint;
  state: BondState;
}

export interface PrivacyRoute {
  routeCode: string;
  cardId: string;
  privacyLevel: PrivacyLevel;
  expiresAt: bigint;
  isTrackable: boolean;
  createdAt: bigint;
  usageCount: number;
}

export interface AccessLink {
  linkId: string;
  cardId: string;
  recipientId: string;
  createdAt: bigint;
  expiresAt: bigint;
  isRevoked: boolean;
  currentLevel: number;
}

export interface Credential {
  cardId: string;
  state: CredentialState;
  commitment: string;
  issuedAt: bigint;
  revokedAt?: bigint;
  revocationHash?: string;
}

// API Response types
export interface CreateCardResponse {
  cardId: string;
  adminId: string;
  txHash: string;
}

export interface PostBondResponse {
  bondId: string;
  requiredAmount: bigint;
  expiresAt: bigint;
  txHash: string;
}

export interface GenerateRouteResponse {
  routeCode: string;
  expiresAt: bigint;
  qrCode?: string;
}

export interface ProgressiveRevealResponse {
  level: number;
  data: string;
  nextLevelAvailable: boolean;
}

// Error types
export class MidnightError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MidnightError';
  }
}

export class ProofGenerationError extends MidnightError {
  constructor(message: string, details?: any) {
    super(message, 'PROOF_GENERATION_FAILED', details);
    this.name = 'ProofGenerationError';
  }
}

export class ContractCallError extends MidnightError {
  constructor(message: string, details?: any) {
    super(message, 'CONTRACT_CALL_FAILED', details);
    this.name = 'ContractCallError';
  }
}

// Helper utilities
export const BytesToHex = (bytes: Uint8Array): string => {
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const HexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
};

export const GenerateCommitment = (data: string, salt: string): string => {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const saltBytes = encoder.encode(salt);
  const combined = new Uint8Array(dataBytes.length + saltBytes.length);
  combined.set(dataBytes);
  combined.set(saltBytes, dataBytes.length);
  return BytesToHex(crypto.subtle.digest('SHA-256', combined) as any);
};
