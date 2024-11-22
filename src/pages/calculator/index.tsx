import { Row, Col, Input, Button, Select, Table, InputNumber } from "antd";
import React, { useState } from "react";
import "./index.css";

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
  const [transactionCurrency, setTransactionCurrency] = useState<string>("");
  const [transactionPayer, setTransactionPayer] = useState<string>("");

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
      setTransactionAmount(0);
      setTransactionCurrency("");
      setTransactionPayer("");
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
      {/* 添加参加者部分 */}
      <div className="section-container">
        <Row gutter={[16, 16]} className="row">
          <Col span={24}>
            <div className="title">参加者追加</div>
          </Col>

          <Col span={20}>
            <Input
              placeholder="参加者姓名"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" block onClick={handleAddParticipant}>
              添加
            </Button>
          </Col>

          <Col span={24}>
            <Table
              columns={[
                {
                  title: "参加者",
                  dataIndex: "participant",
                  key: "participant",
                },

                {
                  title: "",
                  dataIndex: "participant",
                  key: "delete",
                  align: "right",
                  render: (participant: string) => (
                    <Button
                      type="primary"
                      danger
                      onClick={() =>
                        setParticipants(
                          participants.filter((p) => p !== participant)
                        )
                      }
                    >
                      删除
                    </Button>
                  ),
                },
              ]}
              dataSource={participants.map((participant) => ({
                key: participant,
                participant,
              }))}
              pagination={false}
            />
          </Col>
        </Row>
      </div>

      {/* 添加货币种类 */}
      <div className="section-container">
        <Row gutter={[16, 16]} className="row">
          <Col span={24}>
            <div className="title">货币种类追加</div>
          </Col>
          <Col span={24}>
            <div className="title">基准货币</div>
          </Col>
          <Col span={24}>
            <Input
              placeholder="基准货币名"
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
            />
          </Col>
          <Col span={24}>
            <div>其他货币</div>
          </Col>
          <Col span={8}>
            <Input
              placeholder="货币名"
              value={currencyName}
              onChange={(e) => setCurrencyName(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <div style={{ textAlign: "right" }}>1{baseCurrency} = </div>
          </Col>
          <Col span={4}>
            <InputNumber
              placeholder="汇率"
              value={exchangeRate}
              onChange={(value) => setExchangeRate(value as number)}
            />
          </Col>
          <Col span={4}>
            <div>{currencyName}</div>
          </Col>
          <Col span={4}>
            <Button type="primary" block onClick={handleAddCurrency}>
              添加
            </Button>
          </Col>

          <Col span={24}>
            <Table
              columns={[
                {
                  title: "货币名",
                  dataIndex: "name",
                  key: "name",
                  width: "30%",
                },
                {
                  title: "汇率",
                  dataIndex: "rate",
                  key: "rate",
                  width: "50%",
                  render: (rate: number, record) =>
                    `1 ${baseCurrency} = ${rate} ${record.name}`,
                },
                {
                  title: "",
                  dataIndex: "name",
                  key: "delete",
                  align: "right",
                  render: (name: string) => (
                    <Button
                      type="primary"
                      danger
                      onClick={() =>
                        setCurrencies(currencies.filter((c) => c.name !== name))
                      }
                    >
                      删除
                    </Button>
                  ),
                },
              ]}
              dataSource={currencies}
              pagination={false}
            />
          </Col>
        </Row>
      </div>

      {/* 添加收支内容 */}
      <div className="section-container">
        <Row gutter={[16, 16]} className="row">
          <Col span={24}>
            <div className="title">收支内容追加</div>
          </Col>
          <Col span={10}>
            <Input
              placeholder="收支内容"
              value={transactionDescription}
              onChange={(e) => setTransactionDescription(e.target.value)}
            />
          </Col>
          <Col span={3}>
            <Input
              placeholder="金额"
              value={
                transactionAmount !== undefined
                  ? transactionAmount.toString()
                  : ""
              }
              onChange={(e) => setTransactionAmount(parseFloat(e.target.value))}
            />
          </Col>
          <Col span={3}>
            <Select
              value={transactionCurrency}
              onChange={(value) => setTransactionCurrency(value)}
              placeholder="选择货币"
              options={[
                { label: baseCurrency, value: baseCurrency }, // 添加基准货币
                ...currencies.map((currency) => ({
                  label: currency.name,
                  value: currency.name,
                })),
              ]}
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={4}>
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
          </Col>
          <Col span={4}>
            <Button type="primary" block onClick={handleAddTransaction}>
              添加
            </Button>
          </Col>
          <Col span={24}>
            <Table
              columns={[
                {
                  title: "收支内容",
                  dataIndex: "description",
                  key: "description",
                  width: "50%",
                },
                {
                  title: "金额",
                  dataIndex: "amount",
                  key: "amount",
                  width: "12%",
                },
                {
                  title: "币种",
                  dataIndex: "currency",
                  key: "currency",
                  width: "8%",
                },
                {
                  title: "付款人",
                  dataIndex: "payer",
                  key: "payer",
                  width: "15%",
                },
                {
                  title: "",
                  dataIndex: "description",
                  key: "delete",
                  width: "15%",
                  align: "right",
                  render: (description: string) => (
                    <Button
                      type="primary"
                      danger
                      onClick={() =>
                        setTransactions(
                          transactions.filter(
                            (transaction) =>
                              transaction.description !== description
                          )
                        )
                      }
                    >
                      删除
                    </Button>
                  ),
                },
              ]}
              dataSource={transactions}
              pagination={false}
            />
          </Col>
        </Row>
      </div>

      {/* 显示结果 */}
      <div className="section-container">
        <Row gutter={[16, 16]} className="row">
          <Col span={24}>
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
          </Col>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Calculator;
