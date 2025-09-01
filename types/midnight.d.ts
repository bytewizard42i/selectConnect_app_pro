// Midnight window object type definitions for wallet integration
declare global {
  interface Window {
    midnight?: {
      isMidnightWallet?: boolean;
      connect: () => Promise<string[]>;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      // Midnight-specific methods
      proveTransaction: (tx: any) => Promise<any>;
      submitProof: (proof: any) => Promise<string>;
    };
  }
}

// Midnight SDK types
export interface MidnightProvider {
  getContract(address: string): Promise<Contract>;
  getBalance(address: string): Promise<string>;
  getTransaction(txHash: string): Promise<Transaction>;
}

export interface MidnightSigner {
  signMessage(message: string): Promise<string>;
  address: string;
}

export interface Contract {
  call(method: string, args: any[]): Promise<any>;
  address: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  data: string;
  timestamp: number;
}

export {};
