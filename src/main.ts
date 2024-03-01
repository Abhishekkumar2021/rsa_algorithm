import "./style.css";

const p = document.getElementById("p") as HTMLInputElement;
const q = document.getElementById("q") as HTMLInputElement;
const generate = document.getElementById("generate") as HTMLButtonElement;
const publicKey = document.getElementById("public-key") as HTMLDivElement;
const privateKey = document.getElementById("private-key") as HTMLDivElement;
const encryptBtn = document.getElementById("encrypt-btn") as HTMLButtonElement;
const encryptPara = document.getElementById("encrypted-message") as HTMLParagraphElement;
const messageInput = document.getElementById("message") as HTMLTextAreaElement;
const decryptBtn = document.getElementById("decrypt-btn") as HTMLButtonElement;
const encryptedCipher = document.getElementById("encrypted-cipher") as HTMLTextAreaElement;
const decryptedMessage = document.getElementById("decrypted-message") as HTMLParagraphElement;

type Keys = {
  publicKey: {
    n: number;
    e: number;
  };
  privateKey: {
    n: number;
    d: number;
  };
};

const isPrime = (n: number): boolean => {
  if (n === 2) return true;
  if (n < 2 || n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
};

p.addEventListener("input", () => {
  const n = parseInt(p.value);
  if (isPrime(n)) {
    p.style.border = "2px solid rgb(63, 63, 70)";
  } else {
    p.style.border = "2px solid rgb(255, 50, 50)";
  }
});

q.addEventListener("input", () => {
  const n = parseInt(q.value);
  if (isPrime(n)) {
    q.style.border = "2px solid rgb(63, 63, 70)";
  } else {
    q.style.border = "2px solid rgb(255, 50, 50)";
  }
});

const modularExponentiation = (a: number, b: number, n: number): number => {
  let result = 1;
  while (b > 0) {
    if (b % 2 === 1) {
      result = (result * a) % n;
    }
    a = (a * a) % n;
    b = Math.floor(b / 2);
  }
  return result;
};

const gcd = (a: number, b: number): number => {
  if (b === 0) return a;
  return gcd(b, a % b);
};

const getKeys = (p: number, q: number): Keys => {
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  let e = 2;
  while (e < phi) {
    if (gcd(e, phi) === 1) break;
    e++;
  }
  let d = 1;
  while (true) {
    if ((d * e) % phi === 1) break;
    d++;
  }
  return {
    publicKey: {
      n,
      e,
    },
    privateKey: {
      n,
      d,
    },
  };
};

function encrypt(
  message: string,
  publicKey: { n: number; e: number }
): number[] {
  const encryptedMessage = [];
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i);
    const encryptedCharCode = modularExponentiation(
      charCode,
      publicKey.e,
      publicKey.n
    );
    encryptedMessage.push(encryptedCharCode);
  }
  return encryptedMessage;
}

function decrypt(
  encryptedMessage: number[],
  privateKey: { n: number; d: number }
): string {
  let decryptedMessage = "";
  for (let i = 0; i < encryptedMessage.length; i++) {
    const charCode = modularExponentiation(
      encryptedMessage[i],
      privateKey.d,
      privateKey.n
    );
    decryptedMessage += String.fromCharCode(charCode);
  }
  return decryptedMessage;
}

generate.addEventListener("click", () => {
  const pValue = parseInt(p.value);
  const qValue = parseInt(q.value);
  if (isPrime(pValue) && isPrime(qValue)) {
    const keys = getKeys(pValue, qValue);
    publicKey.innerHTML = `(n = ${keys.publicKey.n}, e = ${keys.publicKey.e})`;
    privateKey.innerHTML = `(n = ${keys.privateKey.n}, d = ${keys.privateKey.d})`;

    // set public and private keys to local storage
    localStorage.setItem("publicKey", JSON.stringify(keys.publicKey));
    localStorage.setItem("privateKey", JSON.stringify(keys.privateKey));
  }
});


encryptBtn.addEventListener("click", () => {
  const message = messageInput.value;
  const publicKey = JSON.parse(localStorage.getItem("publicKey") as string);
  if(!publicKey){
    encryptPara.innerHTML = "Please generate the keys first";
    return;
  }
  const encryptedMessage = encrypt(message, publicKey);
  const encryptedMessageString = encryptedMessage.map((charCode) => charCode.toString(2)).join(" ");
  encryptPara.innerHTML = encryptedMessageString;
});

decryptBtn.addEventListener("click", () => {
  const encryptedMessage = encryptedCipher.value.split(" ").map((charCode) => parseInt(charCode, 2));
  const privateKey = JSON.parse(localStorage.getItem("privateKey") as string);
  if(!privateKey){
    decryptedMessage.innerHTML = "Please generate the keys first";
    return;
  }
  const decryptedMessageString = decrypt(encryptedMessage, privateKey);
  decryptedMessage.innerHTML = decryptedMessageString;
});