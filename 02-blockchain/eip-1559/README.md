# EIP-1559 sendRawTransaction Example

## EIP-1559 란

- “base fee(기본 수수료)”를 도입
- 시장 수요에 따라 gas fee를 자동으로 변경하고 사용자(wallet)들의 거래 수수료를 보다 쉽게 추정 가능
- 새로운 거래 유형을 추가
  - 사용자가 지불할 의사가 있는 “max fee(최대 수수료)”
  - 채굴자에게 지불할 의사가 있는 “max priority fee(최대 우선순위 수수료)”
- 이더 인플레이션을 부분적으로 늦추기 위해 base fee를 burn(소각)

## EIP-1559 작동 방식

### **The old gas fee mechanism**

- Miner fee = GasPrice \* GasUsed
- GasUsed (gas): The total amount of gas consumed by the transaction(contract)
- GasPrice (gwei): GaseUsed의 gas당 가격, 1 gwei = 10^(-9) eth
- 입찰 메커니즘을 사용해 GasPrice가 높을수록 트랜잭션 처리 속도가 빨라짐
- 한 블럭에 실을 수 있는 트랜잭션이 정해져있기 때문에, 트랜잭션이 몰리거나 많아질수록 GasPrice가 무한정 높아짐
- 트랜잭션은 miner가 처리하며 발생한 트랜잭션들의 gas fee는 miner가 전부 get

### **The new gas fee mechanism**

- Transaction fee = (baseFee + PriorityFee) \* GasUsed

기존 GasPrice가 (baseFee + PriorityFee)로 분할

**baseFee (base fee)**

이전 블록의 공간 활용도에 따라 이더리움 core에서 자동으로 조정

사용률이 50%를 초과하면 현재 블록의 baseFee가 증가, 그렇지 않으면 감소

2022/7/14 문서 작성 기준 baseFee: 16 ~ 27

baseFee는 Miner에게 가지않고, 이더리움 네트워크에서 완전히 사라짐…(소각)

**PriorityFee (tip)**

기존 GasPrice의 입찰 원리를 활용하는 miner를 위한 TIP.

트랜잭선이 가능한 빨리 블록에 넣고 싶다면 priorityFee를 높게 설정할 수 있다.

동시에 사용자는 maxPriorityFee라고 불리는 팁의 상한선(최대값)을 설정할 수도 있다.

**maxFee (maximum fee)**

사용자가 트랜잭션에 대해 지불할 의사기 있는 가장 높은 거래 수수료를 나타냄

- maxFee = baseFee + maxPriorityFee

maxFee와 maxPriorityFee 둘다 사용자가 설정가능하며 baseFee만 알고리즘에 의해 자동 지정

## **EIP-1559 Transaction Fee Calculation Example**

- Before the upgrade
- Miner Fee = GasPrice \* GasUsed
- After the upgrade
- Transaction Fee = (baseFee + PriorityFee) \* GasUsed
- maxFee >= baseFee + maxPriorityFee

## Reference

[https://medium.com/imtoken/ethereums-london-hard-fork-what-is-eip-1559-f92af9b1034b](https://medium.com/imtoken/ethereums-london-hard-fork-what-is-eip-1559-f92af9b1034b)
