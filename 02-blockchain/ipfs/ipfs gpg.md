## 개요

IPFS에 파일을 올리게 되면 어느 누구나 파일의 해시를 얻어 해당 파일을 열어 볼 수 있다.

그렇기 때문에 민감한 정보를 IPFS에 올리기 위해 별도의 작업이 필요하다.

공개키로 파일을 암호화하고 해당 개인키를 갖고 있는 유저만 복호화하여 파일을 볼 수 있게끔 하면 된다.

## GPG 란?

GNU Privacy Gard의 약자로 PGP(Pretty Good Privacy)라는 전자 우편 암호화 도구를 기반으로 만든 오픈 소스 프로그램이다. 개인/공개키 방식의 RSA 암호화 방식을 사용한다.

GPGTools : [https://gpgtools.org/](https://gpgtools.org/)

MacOS는 위 링크에서 GUI버전을 받아도 되고 `brew install gnupg` 설치

Linux는 기본으로 설치 되어있으며 없다면 `apt-get install gnupg` 설치 

## 실습 1. 공개키 암호화 → 개인키 복호화

준비: private ipfs network 노드 2대

시나리오: 

1. 노드1에서 key (개인키, 공개키) 생성
2. 노드1의 공개키를 노드2에게 공유
3. 노드2에서 파일을 생성하고 노드1의 공개키로 암호화
4. 암호화된 파일을 IPFS에 업로드
5. 노드1은 IPFS에서 암호화된 파일을 다운로드하고 자신의 개인키로 복호화

### key pair 생성

```bash
$ gpg --gen-key

---
pub   rsa3072 2022-02-25 [SC] [expires: 2024-02-25]
      C11FD1E36D670BFF90FDE3AE08DF55BD6E1A37F0
uid                      shjang <shjang@dkargo.io>
sub   rsa3072 2022-02-25 [E] [expires: 2024-02-25]
---
```

생성된 key의 절대경로는 `/root/.gnupg/openpgp-revocs.d`

### key export

```bash
# ASCII armor 방식으로 shjang@dkargo.io 계정의 key를 export
# ASCII armor는 PGP 암호화 유형의 한 기능
$ gpg --export --armor shjang@dkargo.io > shjang.asc
```

export한 노드1의 공개키를 노드2에게 전달한다.

### 파일 암호화

노드2는 노드1로부터 받은 공개키로 파일을 암호화한다.

🖐️ 잠깐! 노드1의 키를 노드2 환경에 등록 필요!!

```bash
# 노드1의 asc key 파일을 import
$ gpg --import shjang.asc

# gpg key list를 확인해보면 shjang 가 unkown 
$ gpg -k
/root/.gnupg/pubring.kbx
------------------------
pub   rsa3072 2022-02-25 [SC] [expires: 2024-02-25]
      C11FD1E36D670BFF90FDE3AE08DF55BD6E1A37F0
uid           [ unknown] shjang <shjang@dkargo.io>
sub   rsa3072 2022-02-25 [E] [expires: 2024-02-25]

# 외부에서 가져온 key를 검증
$ gpg --edit-key C11FD1E36D670BFF90FDE3AE08DF55BD6E1A37F0 trust quit
# enter 5<RETURN> (I trust ultimately)
# enter y<RETURN> (Really set this key to ultimate trust - Yes)

# key list 확인하면 uid가 ultimate로 변경
$ gpg -k
gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
gpg: next trustdb check due at 2024-02-25
/root/.gnupg/pubring.kbx
------------------------
pub   rsa3072 2022-02-25 [SC] [expires: 2024-02-25]
      C11FD1E36D670BFF90FDE3AE08DF55BD6E1A37F0
uid           [ultimate] shjang <shjang@dkargo.io>
sub   rsa3072 2022-02-25 [E] [expires: 2024-02-25]
```

command 1 line으로 사용하고 싶을 때,

`expect -c 'spawn gpg --edit-key {KEY} trust quit; send "5\ry\r"; expect eof'`

계속해서.. 노드2에서 파일을 생성하고 이를 노드1에 공유하기 위해 노드1 공개키로 암호화

```bash
# 공유할 파일 생성
$ echo 'Hey, I`m ipfs02' > gpg_test.txt

# 노드1 공개키로 암호화
$ gpg --encrypt --recipient "shjang" gpg_test.txt

# 원본 파일
$ file gpg_test.txt
gpg_test.txt: ASCII text

# 암호화된 파일
$ file gpg_test.txt.gpg
gpg_test.txt.gpg: PGP RSA encrypted session key - keyid: D6FB46E0 E4227458 RSA (Encrypt or Sign) 3072b
```

### IPFS 업로드

노드2는 노드1에게 파일을 전송하기 위해 ipfs를 이용

```bash
$ ipfs add gpg_test.txt.gpg
added QmYRb4ECWXgAsP23RdJd1LoamHLLrhfgizyqegCQ56gZQ8 gpg_test.txt.gpg
 488 B / 488 B [==================================================================================================] 100.00%

# ipfs pin 확인
$ ipfs pin ls QmYRb4ECWXgAsP23RdJd1LoamHLLrhfgizyqegCQ56gZQ8
QmYRb4ECWXgAsP23RdJd1LoamHLLrhfgizyqegCQ56gZQ8 recursive
```

webui로 해당 hash 조회를 한다면 ??

```jsx
http://141.164.52.45:8080/ipfs/QmPMkt41jSoPB2qT8HQhqNBik49LKBKRpgRkP35BqdDBXz
```

ipfs explorer 조회 시 gpg로 암호화된 파일은 “미리 열어 볼 수 없다”라는 메시지가 뜸

### IPFS 다운로드

복호화를 하기위해 노드1에서 파일 다운로드

```bash
$ ipfs get QmYRb4ECWXgAsP23RdJd1LoamHLLrhfgizyqegCQ56gZQ8
Saving file(s) to QmYRb4ECWXgAsP23RdJd1LoamHLLrhfgizyqegCQ56gZQ8
 488 B / 488 B [===============================================================================================] 100.00% 0s

$ file QmYRb4ECWXgAsP23RdJd1LoamHLLrhfgizyqegCQ56gZQ8
QmYRb4ECWXgAsP23RdJd1LoamHLLrhfgizyqegCQ56gZQ8: PGP RSA encrypted session key - keyid: D6FB46E0 E4227458 RSA (Encrypt or Sign) 3072b .
```

암호화된 파일이라 key 없이는 내용 확인 불가

```bash
cat QmYRb4ECWXgAsP23RdJd1LoamHLLrhfgizyqegCQ56gZQ8
���F��Xt"�
��	  ������mP"�ӽA2)���~����
�N�ւ�B�{��v�vFX��qЄ2o�᭔J��y!�I����iH�M���u!���cG�H��doľ�pd�˲�b���9�{��y��ªD8��4�D�������#�BN�                                       
```

### 파일 복호화

노드1은 자신의 개인키로 파일을 복호화

```bash
$ gpg --decrypt QmYRb4ECWXgAsP23RdJd1LoamHLLrhfgizyqegCQ56gZQ8 > gpg_test.txt

# 패스워드 입력

$ cat gpg_test.txt

Hey, I`m ipfs02
```

## 실습 2. 서명, 개인키 암호화 → 공개키 복호화

시나리오:

1. 노드1의 개인키로 파일을 서명
2. 노드1이 IPFS에 파일 업로드
3. 노드2는 IPFS 파일 다운로드 후 노드1의 공개키로 파일 복호화

### 파일 암호화(서명)

```bash
# 파일 생성
$ echo 'hey I`m ipfs01' > gpg_sign.txt

# 파일 서명(암호화)
$ gpg --sign --armor gpg_sign.txt

# asc 형식의 메시지 확인
$ cat gpg_sign.txt.gpg

-----BEGIN PGP MESSAGE-----

owEB6AEX/pANAwAKAQjfVb1uGjfwAawhYgxncGdfc2lnbi50eHRiGIvvaGV5IElg
bSBpcGZzMDEKiQGzBAABCgAdFiEEwR/R421nC/+Q/eOuCN9VvW4aN/AFAmIYi+8A
CgkQCN9VvW4aN/AAdQv+KjzGSYl7vHc76A1VgqxaXSOZReiMGVlUge28aeLYq8JA
ePDDLZ75+hB0peyI6rELDF/iTbzoDjB7gSFwzWKFGm+vSdrpoZn0ZSSLxlTpsTXJ
4zZPTijQAr6DVQ1uo28Zi4vHMQShv4bHG7aDTsqdj7kCnoF6vsNtemKgDkS8cGjP
KPy8UNyjN5tb3sEPpMNIuy60Vo9aYaMm4aVAmIDwhCcL4VLBf2r0SJsepUzRKXW9
FwtLYQ+wBVt+dTnTpMhmTgIzK2EIwYSpsArNKrcHIdQqjV2qI+bNLdApGyji1g/J
MTiVI2m5+4ieyTIOrbCd/FzvjXfMrnldIqJjGg8SP9QSlOcr6KgiMh935QrrfU0y
9ErBQfkyvyBnTm3DHpBza0EQaeum+f+UUPZBMyGxwlidBJ2FU3bqT1+ukK5XNRaW
3h59W9ykW84Jrf3SAE/dmXKWmOjL3gnmUH2+hqn/+bkgbG5zVpYfKFb2pBAiCU/v
7J8l+uEmLIYKx7k3vPSo
=+p6w
-----END PGP MESSAGE-----
```

### IPFS 업로드

```bash
$ ipfs add gpg_sign.txt.asc
added QmW9WeU3JDUFQPm9r589cw1J7vg53qfPL3ekqt3MonpFqr gpg_sign.txt.asc
 732 B / 732 B [==================================================================================================] 100.00%
```

webui에서 확인 시 ..

PGP 메시지 확인 가능

### IPFS 다운로드

노드2에서 ipfs hash 값으로 파일 다운로드

```bash
$ ipfs get QmW9WeU3JDUFQPm9r589cw1J7vg53qfPL3ekqt3MonpFqr
Saving file(s) to QmW9WeU3JDUFQPm9r589cw1J7vg53qfPL3ekqt3MonpFqr
 732 B / 732 B [===============================================================================================] 100.00% 0s
```

### 파일 복호화

```bash
$ gpg -d QmW9WeU3JDUFQPm9r589cw1J7vg53qfPL3ekqt3MonpFqr > gpg_sign.txt

gpg: Signature made Fri 25 Feb 2022 07:57:35 AM UTC
gpg:                using RSA key C11FD1E36D670BFF90FDE3AE08DF55BD6E1A37F0
gpg: Good signature from "shjang <shjang@dkargo.io>" [ultimate]

# 복호화된 파일 확인
cat gpg_sign.txt

hey I`m ipfs01
```

### 참조 사이트

- [https://steemit.com/kr/@evasioner/part-5-ipfs](https://steemit.com/kr/@evasioner/part-5-ipfs)
- [https://johngrib.github.io/wiki/gpg/#공개-키-export](https://johngrib.github.io/wiki/gpg/#%EA%B3%B5%EA%B0%9C-%ED%82%A4-export)