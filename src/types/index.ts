export type Chat = {
  name: string;
  dirName: string;
  lastSent: number;
  title: string;
};
export enum MessageType {
  Generic = 'Generic',
  Unsubscribe = 'Unsubscribe',
  Subscribe = 'Subscribe',
  Call = 'Call',
  Share = 'Share',
}
export type Message = (
  | {
      type: MessageType.Unsubscribe | MessageType.Unsubscribe;
      users: {
        name: string;
      }[];
    }
  | {
      type: MessageType.Call;
      call_duration: number;
    }
  | {
      type: MessageType.Share;
      share?: {
        link: string;
      };
    }
  | {
      type: MessageType.Generic;
      photos?: {
        uri: string;
        creation_timestamp: number;
      }[];
    }
) & {
  sender_name: string;
  timestamp_ms: number;
  content: string;
  is_unsent: boolean;
};
export type MessageData = {
  messages: Message[];
  participants: {
    name: string;
  }[];
  title: string;
  is_still_participant: boolean;
  // TODO:
  thread_type: string;
  thread_path: string;
};
