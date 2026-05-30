class PeerService {
  public peer: RTCPeerConnection | null = null;
  public dataChannel: RTCDataChannel | null = null;

  constructor() {
    this.createPeer();
  }

  private createPeer(): void {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ]
        }
      ]
    });
  }

  async getAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peer) {
      throw new Error('RTCPeerConnection not initialized');
    }

    try {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    } catch (error: unknown) {
      throw new Error(`Failed to create answer: ${(error as Error).message}`);
    }
  }

  async setLocalDescription(ans: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peer) {
      throw new Error('RTCPeerConnection not initialized');
    }

    try {
      await this.peer.setRemoteDescription(ans);
    } catch (error: unknown) {
      throw new Error(`Failed to set remote description: ${(error as Error).message}`);
    }
  }

  async getOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peer) {
      throw new Error('RTCPeerConnection not initialized');
    }

    try {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    } catch (error: unknown) {
      throw new Error(`Failed to create offer: ${(error as Error).message}`);
    }
  }

  cleanup(): void {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
      this.dataChannel = null;
    }
  }

  resetPeer(): void {
    this.cleanup();
    this.createPeer();
  }
}

export default new PeerService();