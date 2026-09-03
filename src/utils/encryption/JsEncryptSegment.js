import JSEncrypt from 'jsencrypt';

class JsEncryptSegment {
  constructor(publicKeyPem, privateKeyPem = null) {
    const start = '-----BEGIN PUBLIC KEY-----'
    const end = '-----END PUBLIC KEY-----'
    const first = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0gnLEhUDU7q7LJykmMjaQTLmGg+e9jNOmbUDM/ci44Ds9oxO7ExWnxWp+DhW9bNVQeu'
    const second = 'fgm5f9rHp7buTOL7k9wdik3zoxWMiT338TlGqrRzoiR8NPvjK3HzxQFh/T/RIhcohQAliD/Ttbjp+Q0bu34ftTAw5cFry6OxnpeQhfnYMzxeRat0T4q28rTg/3wAv'
    const thrid = '9uioaBOeBGggEWxg5p9vm1LECn9jlEflsu0CaRwreMQl6zT+MPCJAUGPRebN9FGIpgrC5UXgU7nWcCrtRB9Q'
    const forth = 'sUBsg8ROuaDzpAzr8f4Sk3fRslh2FDqxKJaL8KKjIQig9Ej07nCmQsP3v8kRcT7KEwIDAQAB'

    this.encryptor = new JSEncrypt();
    this.encryptor.setPublicKey(start+first+second+thrid+forth+end);
    if (privateKeyPem) {
      this.encryptor.setPrivateKey(privateKeyPem);
    }
    
    // RSA 1024: 117字节，2048: 245字节
    this.chunkSize = 117; // PKCS#1 v1.5填充
  }

  // 分段加密
  encryptLongString(str) {
    const chunks = [];
    
    // 将字符串分割成块
    for (let i = 0; i < str.length; i += this.chunkSize) {
      const chunk = str.substring(i, i + this.chunkSize);
      chunks.push(chunk);
    }
    
    // 加密每个块
    const encryptedChunks = chunks.map(chunk => {
      return this.encryptor.encrypt(chunk);
    });
    
    // 返回JSON格式的加密数据
    return JSON.stringify({
      chunks: encryptedChunks,
      len: encryptedChunks.length,
      chunkSize: this.chunkSize
    });
  }

  // 分段解密
  decryptLongString(encryptedJson) {
    const data = JSON.parse(encryptedJson);
    const decryptedChunks = data.chunks.map(chunk => {
      return this.encryptor.decrypt(chunk);
    });
    
    // 合并解密后的块
    return decryptedChunks.join('');
  }

  // Base64版本（更紧凑）
  encryptToBase64(str) {
    const chunks = [];
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    // 处理二进制数据
    for (let i = 0; i < data.length; i += this.chunkSize) {
      const chunk = data.slice(i, i + this.chunkSize);
      const chunkStr = String.fromCharCode(...chunk);
      const encrypted = this.encryptor.encrypt(chunkStr);
      
      if (!encrypted) {
        throw new Error('Encryption failed');
      }
      
      // 将Base64编码的加密结果转为Uint8Array
      const binaryString = atob(encrypted);
      const encryptedBytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        encryptedBytes[j] = binaryString.charCodeAt(j);
      }
      
      chunks.push(encryptedBytes);
    }
    
    // 合并所有加密块
    return this.combineToBase64(chunks);
  }

  combineToBase64(chunks) {
    // 计算总长度（每个块前加2字节表示长度）
    let totalLength = 0;
    chunks.forEach(chunk => {
      totalLength += 2 + chunk.length; // 2字节用于存储长度
    });
    
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    chunks.forEach(chunk => {
      const length = chunk.length;
      
      // 写入块长度（2字节，最大65535）
      result[offset] = (length >> 8) & 0xff;
      result[offset + 1] = length & 0xff;
      offset += 2;
      
      // 写入块数据
      result.set(chunk, offset);
      offset += length;
    });
    
    // 转换为Base64
    return btoa(String.fromCharCode(...result));
  }
}

const jsEncryptSegment = new JsEncryptSegment();

const encryptData = jsEncryptSegment;
  
export default encryptData;
