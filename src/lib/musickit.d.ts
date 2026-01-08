// types/musickit.d.ts

interface MusicKitInstance {
  configure(config: MusicKitConfig): Promise<MusicKitInstance>;
  getInstance(): MusicKitInstance;
  authorize(): Promise<string>;
  unauthorize(): Promise<void>;
  isAuthorized: boolean;
  musicUserToken: string;
  // Add other methods you need
}

interface MusicKitConfig {
  developerToken: string;
  app: {
    name: string;
    build: string;
    icon?: string;
  };
}

interface AppleIDSignInAPI {
  auth: {
    init(config: AppleIDConfig): void;
    signIn(): Promise<AppleIDSignInResponse>;
    signOut(): void;
  };
}

interface AppleIDConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state?: string;
  usePopup?: boolean;
}

interface AppleIDSignInResponse {
  authorization: {
    code: string;
    id_token: string;
    state?: string;
  };
  user?: {
    email: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
}

declare global {
  interface Window {
    MusicKit?: MusicKitInstance;
    AppleID?: AppleIDSignInAPI;
  }
}

export {};
