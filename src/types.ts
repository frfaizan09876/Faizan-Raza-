export interface FactoryInfo {
  phoneNumber: string;
  factoryAddress: string;
  youtubeId: string;
  youtubeUrl: string;
  ownerName: string;
}

export interface PipeItem {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface PipeConfig {
  pipesSizeAvailable: string;
  perLotPrize: string;
}

export interface MachineItem {
  id: string;
  name: string;
  status: "ONLINE" | "OFFLINE";
}

export interface AuthHistoryItem {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  phoneNumber?: string;
  timestamp: string;
  eventType: "signup" | "login";
}

export interface AppState {
  factoryInfo: FactoryInfo;
  pipeConfig: PipeConfig;
  pipesList: PipeItem[];
  machines: MachineItem[];
  logoUrl?: string; // Customizable App Logo (base64 or custom path)
}

