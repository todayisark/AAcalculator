import Card from "../../components/Card";
import {
  Row,
  Col,
  Input,
  Button,
  Select,
  Table,
  InputNumber,
  Form,
  List,
} from "antd";
import React, { useState } from "react";

const Calculator = () => {
  // 参加者状态
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState<string>("");

  // 货币状态
  const [currencies, setCurrencies] = useState<
    { name: string; rate: number }[]
  >([]);
  const [baseCurrency, setBaseCurrency] = useState<string>("CNY");
  const [currencyName, setCurrencyName] = useState<string>("KRW");
  const [exchangeRate, setExchangeRate] = useState<number>(200);

  // 收支状态
  const [transactions, setTransactions] = useState<
    { description: string; amount: number; currency: string; payer: string }[]
  >([]);
  const [transactionDescription, setTransactionDescription] =
    useState<string>("");
  const [transactionAmount, setTransactionAmount] = useState<
    number | undefined
  >(undefined);
  const [transactionCurrency, setTransactionCurrency] = useState<
    string | undefined
  >(undefined);
  const [transactionPayer, setTransactionPayer] = useState<string | undefined>(
    undefined
  );

  // 结算货币状态
  const [settleCurrency, setSettleCurrency] = useState<string>(baseCurrency);

  // 处理参加者添加
  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      if (participants.includes(newParticipant)) {
        // 如果参加者已经存在，弹出提示或者阻止添加
        alert("参加者已存在，不能重复添加");
      } else {
        setParticipants([...participants, newParticipant]);
        setNewParticipant("");
      }
    }
  };

  // 处理货币添加
  const handleAddCurrency = () => {
    if (currencyName.trim() && exchangeRate > 0) {
      const currencyExists = currencies.some(
        (currency) => currency.name === currencyName
      );
      if (currencyExists) {
        // 如果货币已经存在，弹出提示或者阻止添加
        alert("货币已存在，不能重复添加");
      } else {
        setCurrencies([
          ...currencies,
          { name: currencyName, rate: exchangeRate },
        ]);
        setCurrencyName("");
        setExchangeRate(1);
      }
    }
  };

  // 处理收支添加
  const handleAddTransaction = () => {
    if (
      transactionDescription.trim() &&
      transactionAmount !== undefined &&
      transactionAmount > 0 &&
      transactionCurrency &&
      transactionPayer
    ) {
      setTransactions([
        ...transactions,
        {
          description: transactionDescription,
          amount: transactionAmount,
          currency: transactionCurrency,
          payer: transactionPayer,
        },
      ]);
      setTransactionDescription("");
      setTransactionAmount(undefined);
      setTransactionCurrency(undefined);
      setTransactionPayer(undefined);
    }
  };

  // 计算分摊金额
  const calculateSplit = () => {
    const totalAmountPerParticipant: {
      [key: string]: { [key: string]: number };
    } = {};
    const totalParticipants = participants.length;

    participants.forEach((participant) => {
      totalAmountPerParticipant[participant] = {};
      participants.forEach((otherParticipant) => {
        totalAmountPerParticipant[participant][otherParticipant] = 0;
      });
    });

    transactions.forEach((transaction) => {
      const rate =
        currencies.find((currency) => currency.name === transaction.currency)
          ?.rate || 1;
      const settleRate =
        currencies.find((currency) => currency.name === settleCurrency)?.rate ||
        1;

      const amountInBaseCurrency = transaction.amount / rate;
      const splitAmount = amountInBaseCurrency / totalParticipants;
      const finalAmount = splitAmount * settleRate;

      // 付款人减少自己应付的金额
      participants.forEach((participant) => {
        if (participant !== transaction.payer) {
          totalAmountPerParticipant[participant][transaction.payer] +=
            finalAmount;
        }
      });
    });

    // 合并欠款
    participants.forEach((payer) => {
      participants.forEach((receiver) => {
        if (
          totalAmountPerParticipant[payer][receiver] >
          totalAmountPerParticipant[receiver][payer]
        ) {
          totalAmountPerParticipant[payer][receiver] -=
            totalAmountPerParticipant[receiver][payer];
          totalAmountPerParticipant[receiver][payer] = 0; // 清空另一方向的金额
        } else {
          totalAmountPerParticipant[receiver][payer] -=
            totalAmountPerParticipant[payer][receiver];
          totalAmountPerParticipant[payer][receiver] = 0; // 清空该方向的金额
        }
      });
    });

    return totalAmountPerParticipant;
  };

  const splitResults = calculateSplit();

  // 将分摊结果格式化为表格数据
  const tableData: any[] = [];
  participants.forEach((payer) => {
    participants.forEach((receiver) => {
      if (splitResults[payer][receiver] > 0) {
        tableData.push({
          key: `${payer}-${receiver}`,
          giver: payer,
          receiver: receiver,
          amount: splitResults[payer][receiver].toFixed(2),
        });
      }
    });
  });

  const columns = [
    {
      title: "付款人",
      dataIndex: "giver",
      key: "giver",
    },
    {
      title: "收款人",
      dataIndex: "receiver",
      key: "receiver",
    },
    {
      title: `应付金额 (${settleCurrency})`,
      dataIndex: "amount",
      key: "amount",
    },
  ];

  return (
    <div className="container">
      <Form>
        {/* 添加参加者部分 */}
        <Card title="添加参加者">
          <Row gutter={[16, 16]} className="row">
            <Col span={18}>
              <Input
                placeholder="参加者名"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
              />
            </Col>
            <Col span={6}>
              <Button type="primary" block onClick={handleAddParticipant}>
                添加
              </Button>
            </Col>

            <Col span={24}>
              <List
                className="pl-10 pr-10"
                dataSource={participants}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        danger
                        onClick={() =>
                          setParticipants(
                            participants.filter((p) => p !== item)
                          )
                        }
                      >
                        删除
                      </Button>,
                    ]}
                  >
                    {item}
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        </Card>

        {/* 汇率设置 */}
        <Card title="汇率设置">
          <Row gutter={[16, 16]}>
            <Col span={18}>
              <Form.Item label="基准货币" colon={false}>
                <Input
                  placeholder="基准货币名"
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="其他货币" colon={false}>
                <Input
                  placeholder="货币名"
                  value={currencyName}
                  onChange={(e) => setCurrencyName(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="汇率" colon={false}>
                <div className="flex-row">
                  <span>{`1 ${baseCurrency} = `}</span>
                  <InputNumber
                    placeholder="汇率"
                    value={exchangeRate}
                    onChange={(value) => setExchangeRate(value as number)}
                  />
                  <span>{currencyName}</span>
                </div>
              </Form.Item>
              <Button type="primary" onClick={handleAddCurrency}>
                确认
              </Button>

              <div className="mt-40 mb-20">
                {`当前汇率：${baseCurrency} -> ${currencyName} = ${exchangeRate}`}
              </div>
            </Col>
          </Row>
        </Card>

        {/* 添加收支内容 */}
        <Card title="添加消费明细">
          <Row gutter={[16, 16]}>
            <Col span={18}>
              <Form.Item label="内容" colon={false}>
                <Input
                  placeholder="内容"
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="金额" colon={false}>
                <div className="flex-row" style={{ gap: 10 }}>
                  <Input
                    addonAfter={
                      <Select
                        value={transactionCurrency}
                        onChange={(value) => setTransactionCurrency(value)}
                        placeholder="币种"
                        options={[
                          { label: baseCurrency, value: baseCurrency }, // 添加基准货币
                          ...currencies.map((currency) => ({
                            label: currency.name,
                            value: currency.name,
                          })),
                        ]}
                        style={{ width: "100px" }}
                        allowClear
                      />
                    }
                    defaultValue="mysite"
                    placeholder="金额"
                    value={
                      transactionAmount !== undefined
                        ? transactionAmount.toString()
                        : ""
                    }
                    onChange={(e) =>
                      setTransactionAmount(parseFloat(e.target.value))
                    }
                  />
                </div>
              </Form.Item>
              <Form.Item label="付款人" colon={false}>
                <Select
                  value={transactionPayer}
                  onChange={(value) => setTransactionPayer(value)}
                  placeholder="选择付款人"
                  options={participants.map((participant) => ({
                    label: participant,
                    value: participant,
                  }))}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Button
                type="primary"
                onClick={handleAddTransaction}
                className="mb-20"
              >
                添加
              </Button>
            </Col>
          </Row>

          <List
            dataSource={transactions}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    danger
                    onClick={() =>
                      setTransactions(
                        transactions.filter(
                          (transaction) =>
                            transaction.description !== item.description
                        )
                      )
                    }
                  >
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.description}
                  description={`金额：${item.amount} ${item.currency}　付款人：${item.payer}`}
                />
              </List.Item>
            )}
          />
        </Card>

        {/* 显示结果 */}
        <Card
          title={
            <div className="title">
              费用分摊结果
              <Select
                value={settleCurrency}
                onChange={(value) => setSettleCurrency(value)}
                placeholder="选择结算货币"
                options={[
                  { label: baseCurrency, value: baseCurrency }, // 添加基准货币
                  ...currencies.map((currency) => ({
                    label: currency.name,
                    value: currency.name,
                  })),
                ]}
                style={{ marginLeft: 10 }}
              />
              <Button
                type="primary"
                style={{ marginLeft: 10 }}
                onClick={calculateSplit}
              >
                刷新结算结果
              </Button>
            </div>
          }
        >
          <Row gutter={[16, 16]} className="row">
            <Col span={24}></Col>
            <Col span={24}>
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
              />
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default Calculator;
