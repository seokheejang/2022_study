### IPFS 란

IPFS는 파일, 웹 사이트, 응용 프로그램 및 데이터를 저장하고 액세스하기 위한 분산 시스템

InterPlanetary File System - 행성처럼 멀리 떨어진 곳에서도 작동하는 시스템을 구축하는 것을 목표. (웹을 완벽하게 분산화하는 것)

기존 주소와의 차이점 (위치 기반 주소 vs 컨텐츠 기반 주소)

```jsx
[https://en.wikipedia.org/wiki/Aardvark](https://en.wikipedia.org/wiki/Aardvark)
```

```jsx
[https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki/Aardvark.html](https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki/Aardvark.html)
```

**The centralized web: Location-based addressing**

- URL(Uniform Resource Locators)은 중앙 집중식 웹의 데이터에 대해 서로에게 제공하는 기본 주소

**The decentralized web: Content addressing**

- 동일한 데이터에 대해 동일한 알고리즘을 사용하는 사람은 누구나 동일한 해시에 도달
- 암호화 해시는 고유한 값 (사진을 보지않고 해시값으로 파일 구분 가능)

### IPFS 작동 방식

IPFS는 피어 투 피어(p2p) 스토리지 네트워크

1. 콘텐츠 주소 지정을 통한 고유 식별
2. 방향성 비순환 그래프(DAG)를 통한 콘텐츠 연결
3. DHT(분산 해시 테이블)를 통한 콘텐츠 검색

**Cryptographic hashing and Content Identifiers (CIDs)**

- CID(콘텐츠 식별자)는 분산 웹에서 사용되는 특정 형식의 콘텐츠 주소 지정
- 기본적으로 `sha-256` 해싱 알고리즘을 사용
- 추가로 멀티해시, 디코딩 알고리즘
- Qm...로 시작하는 46길이의 문자열

multihash fomat

```bash
fn code  dig size hash digest
-------- -------- -----------------------------------
00010001 00000100 10110110 11111000 01011100 10110101
sha1     4 bytes  4 byte sha1 digest
```

**DAGs (Merkle Directed Acyclic Graphs) 방향성 비순환 그래프** 

- IPFS는 DAG를 사용하여 IPFS에 저장된 모든 데이터를 추적
- IPFS를 사용하면 콘텐츠에 CID를 부여하고 해당 콘텐츠를 Merkle DAG에서 함께 연결 가능
    
    [DAG builder visualization](https://dag.ipfs.io/)
    

**DHT (Distributed Hash Tables) 분산 해시 테이블**

- 어떤 피어가 콘텐츠를 호스팅하고 있는지 찾기 위해( *discovery* ) IPFS는 분산 해시 테이블 또는 DHT를 사용
- 누가 어떤 데이터를 가지고 있는지 저장하는 거대한 테이블이라고 생각

**Garbage collection**

IPFS는 가비지 수집을 사용하여 더 이상 필요하지 않다고 생각하는 데이터를 삭제하여 IPFS 노드의 디스크 공간을 확보

- `StorageGCWatermarkStorageMax`: 자동 가비지 수집이 활성화된 상태에서 데몬이 실행 중인 경우 가비지 수집이 자동으로 트리거되는 값 의 백분율. 기본값은 90`.
- `GCPeriod`: 가비지 수집을 실행해야 하는 빈도를 지정. 자동 가비지 수집이 활성화된 경우에만 사용. 기본값은 1시간.

**Pinning in context**

IPFS 노드는 다양한 종류의 사용자 이벤트를 기반으로 하는 가비지 수집으로부터 데이터를 보호할 수 있다.

- 보편적인 방법은 저수준 **[로컬 핀](https://docs.ipfs.io/how-to/pin-files/)`[ipfs add](https://docs.ipfs.io/reference/cli/#ipfs-add)`**을 추가하는 것. 이것은 모든 데이터 유형에 대해 작동하며 수동으로 수행할 수 있지만 CLI 명령을 사용하여 파일을 추가하면 IPFS 노드가 자동으로 해당 파일을 고정.
- 파일과 디렉토리로 작업할 때 더 나은 방법은 로컬 **[MFS(Mutable File System)](https://docs.ipfs.io/concepts/glossary/#mfs)**에 추가하는 것 이다. 이것은 로컬 고정과 같은 방식으로 가비지 수집으로부터 데이터를 보호하지만 관리하기가 다소 쉽다.

**Pinning services**

중요한 데이터를 유지하려면 고정 서비스를 사용하는 것이 좋다. 이러한 서비스는 많은 IPFS 노드를 실행하고 사용자가 해당 노드에 데이터를 고정할 수 있도록 한다.

- 디스크 공간이 많지 않지만 데이터가 계속 유지되도록 하고 싶을 때.
- 컴퓨터는 네트워크에 간헐적으로 연결되는 랩톱, 전화 또는 태블릿. 그러나 추가한 장치가 오프라인인 경우에도 언제 어디서나 IPFS의 데이터에 액세스할 수 있기를 원할 때.
- 자신의 컴퓨터에서 실수로 데이터를 삭제하거나 가비지 수집하는 경우 네트워크의 다른 컴퓨터에서 데이터를 항상 사용할 수 있도록 하는 백업이 필요하다.

사용 가능한 Pinning services 제공업체

- **[Axel(opens new window)](https://www.axel.org/2019/07/23/qa-with-the-developers-of-axel-ipfs/)**
- **[Eternum(opens new window)](https://www.eternum.io/)**
- **[Infura(opens new window)](https://infura.io/)**
- **[Pinata(opens new window)](https://pinata.cloud/)**
- **[Temporal(opens new window)](https://temporal.cloud/)**
- **[Crust Network](https://crust.network/)**

**Bitswap**

Bitswap은 데이터 블록을 교환하기 위한 IPFS의 핵심 모듈 네트워크의 다른 피어와 블록을 요청하고 전송하도록 지시.

피어가 세션에 추가되면 클라이언트가 원하는 각 블록에 대해 Bitswap은 각 세션 피어에게 원하는 피어를 보내 *블록* 이 있는 피어를 찾는다. 피어는 *have* 또는 *dont_have* 로 응답. Bitswap은 각 블록이 있는 노드와 없는 노드의 맵을 작성. Bitswap은 블록이 있는 피어에게 *원하는 블록* 을 보내고 블록 자체로 응답. 블록이 있는 피어가 없으면 Bitswap은 DHT에 쿼리하여 블록이 있는 공급자를 찾는다.

**InterPlanetary Name System (IPNS)**

IPFS는 **[콘텐츠 기반 주소 지정을](https://docs.ipfs.io/concepts/content-addressing/)** 사용. 파일에 포함된 데이터를 기반으로 파일 주소를 생성한다. `/ipfs/QmbezGequPwcsWo8UL4wDF6a8hYwM1hmbzYv2mnKkEWaUp`다른 사람 과 같은 IPFS 주소를 공유하려는 경우 콘텐츠를 업데이트할 때마다 해당 사람에게 새 링크를 제공해야 한다.

IPNS(InterPlanetary Name System)는 업데이트할 수 있는 주소를 만들어 이 문제를 해결.

IPNS는 IPFS에서 변경 가능한 주소를 만드는 유일한 방법이 아니며, 현재 IPNS보다 훨씬 빠르고 사람이 읽을 수 있는 이름을 사용하는 **[DNSLink](https://docs.ipfs.io/concepts/dnslink/)** 를 사용할 수도 있다 .

**Work with blocks**

이 `ipfs add`명령은 지정한 파일의 데이터에서 Merkle DAG를 생성. **[UnixFS 데이터 형식을](https://github.com/ipfs/go-unixfs/blob/master/pb/unixfs.proto)** 따름. 이것을 할 때. 즉, 파일이 블록으로 분할된 다음 '링크 노드'를 사용하여 트리와 같은 구조로 정렬되어 함께 묶인다. 주어진 파일의 '해시'는 실제로 DAG에 있는 루트(최상위) 노드의 해시. 지정된 DAG의 경우 를 사용하여 그 아래의 하위 블록을 쉽게 볼 수 있다 `ipfs ls`.

예를 들어:

```jsx
# Ensure this file is larger than 256k.
ipfs add alargefile
ipfs ls thathash
```

위의 명령은 다음과 같이 출력.

```jsx
ipfs@earth ~> ipfs ls qms2hjwx8qejwm4nmwu7ze6ndam2sfums3x6idwz5myzbn
> qmv8ndh7ageh9b24zngaextmuhj7aiuw3scc8hkczvjkww 7866189
> qmuvjja4s4cgyqyppozttssquvgcv2n2v8mae3gnkrxmol 7866189
> qmrgjmlhlddhvxuieveuuwkeci4ygx8z7ujunikzpfzjuk 7866189
> qmrolalcquyo5vu5v8bvqmgjcpzow16wukq3s3vrll2tdk 7866189
> qmwk51jygpchgwr3srdnmhyerheqd22qw3vvyamb3emhuw 5244129
```

파일의 모든 즉각적인 하위 블록과 디스크의 하위 블록 및 하위 블록의 크기를 보여준다.