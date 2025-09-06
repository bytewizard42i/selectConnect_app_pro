/**
 * Midnight Network TypeScript Definitions
 * 
 * This file provides comprehensive type definitions for integrating with the Midnight Network
 * blockchain and its privacy-preserving features. These types enable SelectConnect to
 * interact with Midnight's zero-knowledge proof system and smart contracts.
 * 
 * Key Features:
 * - Window object extensions for Midnight wallet integration
 * - Provider interfaces for blockchain interaction
 * - Signer interfaces for transaction signing and proof generation
 * - Contract interfaces for smart contract method calls
 * - Transaction types for blockchain operations
 */

/**
 * Global window object extension for Midnight wallet integration
 * 
 * The Midnight wallet injects itself into the browser's window object,
 * similar to MetaMask but with additional privacy-preserving capabilities.
 * This interface defines the expected structure and methods available.
 */
declare global {
  interface Window {
    midnight?: {
      /** Flag indicating if the Midnight wallet is installed and available */
      isMidnightWallet?: boolean;
      
      /** 
       * Connect to the Midnight wallet and request account access
       * @returns Promise resolving to array of connected account addresses
       */
      connect: () => Promise<string[]>;
      
      /** 
       * Generic RPC request method for wallet communication
       * @param args Object containing method name and optional parameters
       * @returns Promise resolving to method-specific response
       */
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      
      /** 
       * Register event listener for wallet events (account changes, network changes, etc.)
       * @param event Event name to listen for
       * @param callback Function to execute when event occurs
       */
      on: (event: string, callback: (...args: any[]) => void) => void;
      
      /** 
       * Remove previously registered event listener
       * @param event Event name to stop listening for
       * @param callback Specific callback function to remove
       */
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      
      /** 
       * Generate zero-knowledge proof for a transaction
       * This is Midnight's core privacy feature - transactions are proven valid
       * without revealing sensitive details like amounts or participant identities
       * @param tx Transaction object to generate proof for
       * @returns Promise resolving to generated zero-knowledge proof
       */
      proveTransaction: (tx: any) => Promise<any>;
      
      /** 
       * Submit a zero-knowledge proof to the Midnight network
       * @param proof Generated proof object from proveTransaction
       * @returns Promise resolving to transaction hash
       */
      submitProof: (proof: any) => Promise<string>;
    };
  }
}

/**
 * Midnight Network Provider Interface
 * 
 * The provider serves as the main entry point for interacting with the Midnight blockchain.
 * It handles contract instantiation, balance queries, and transaction retrieval while
 * maintaining privacy through zero-knowledge proofs.
 */
export interface MidnightProvider {
  /** 
   * Get a contract instance for interacting with deployed smart contracts
   * @param address The on-chain address of the deployed contract
   * @returns Promise resolving to Contract interface for method calls
   */
  getContract(address: string): Promise<Contract>;
  
  /** 
   * Query account balance while preserving privacy
   * Note: In Midnight, balances may be obfuscated or require proof of ownership
   * @param address Account address to query balance for
   * @returns Promise resolving to balance string (in smallest unit)
   */
  getBalance(address: string): Promise<string>;
  
  /** 
   * Retrieve transaction details by hash
   * @param txHash Transaction hash to look up
   * @returns Promise resolving to Transaction object with metadata
   */
  getTransaction(txHash: string): Promise<Transaction>;
}

/**
 * Midnight Network Signer Interface
 * 
 * The signer handles cryptographic operations including message signing
 * and zero-knowledge proof generation. It represents a user's identity
 * and authorization capabilities within the Midnight ecosystem.
 */
export interface MidnightSigner {
  /** 
   * Sign a message using the user's private key
   * This is used for authentication and proof of ownership
   * @param message String message to sign
   * @returns Promise resolving to cryptographic signature
   */
  signMessage(message: string): Promise<string>;
  
  /** The public address associated with this signer */
  address: string;
}

/**
 * Smart Contract Interface for Midnight Network
 * 
 * Represents a deployed smart contract on Midnight blockchain.
 * All method calls automatically generate and submit zero-knowledge proofs
 * to maintain privacy while ensuring transaction validity.
 */
export interface Contract {
  /** 
   * Call a method on the smart contract
   * This automatically handles zero-knowledge proof generation and submission
   * @param method Name of the contract method to call
   * @param args Array of arguments to pass to the method
   * @returns Promise resolving to method return value
   */
  call(method: string, args: any[]): Promise<any>;
  
  /** The on-chain address where this contract is deployed */
  address: string;
}

/**
 * Transaction Object for Midnight Network
 * 
 * Represents a completed transaction on the Midnight blockchain.
 * Note that due to privacy features, some fields may be obfuscated
 * or only visible to transaction participants.
 */
export interface Transaction {
  /** Unique transaction hash identifier */
  hash: string;
  
  /** Address that initiated the transaction */
  from: string;
  
  /** Destination address for the transaction */
  to: string;
  
  /** Transaction value in smallest unit (may be obfuscated for privacy) */
  value: string;
  
  /** Transaction data payload (may be encrypted) */
  data: string;
  
  /** Unix timestamp when transaction was mined */
  timestamp: number;
}

export {};
