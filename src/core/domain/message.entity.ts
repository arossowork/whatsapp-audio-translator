export type MessageStatus = 'pending' | 'processing' | 'completed' | 'failed';

export class Message {
  constructor(
    public readonly id: string,
    public readonly payload: string,
    public readonly status: MessageStatus = 'pending',
    public readonly createdAt: Date = new Date(),
  ) {}

  withStatus(status: MessageStatus): Message {
    return new Message(this.id, this.payload, status, this.createdAt);
  }
}
