import { Row, Col, Input, Button, List, Select, Table } from "antd";
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
  const [baseCurrency, setBaseCurrency] = useState<string>("");
  const [currencyName, setCurrencyName] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  // 收支状态
  const [transactions, setTransactions] = useState<
    { description: string; amount: number; currency: string }[]
  >([]);
  const [transactionDescription, setTransactionDescription] =
    useState<string>("");
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [transactionCurrency, setTransactionCurrency] = useState<string>("");

  // 处理参加者添加
  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      setParticipants([...participants, newParticipant]);
      setNewParticipant("");
    }
  };

  // 处理货币添加
  const handleAddCurrency = () => {
    if (currencyName.trim() && exchangeRate > 0) {
      setCurrencies([
        ...currencies,
        { name: currencyName, rate: exchangeRate },
      ]);
      setCurrencyName("");
      setExchangeRate(1);
    }
  };

  // 处理收支添加
  const handleAddTransaction = () => {
    if (
      transactionDescription.trim() &&
      transactionAmount > 0 &&
      transactionCurrency
    ) {
      setTransactions([
        ...transactions,
        {
          description: transactionDescription,
          amount: transactionAmount,
          currency: transactionCurrency,
        },
      ]);
      setTransactionDescription("");
      setTransactionAmount(0);
      setTransactionCurrency("");
    }
  };

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
            <div>参加者</div>
            <List
              bordered
              dataSource={participants}
              renderItem={(item) => <List.Item>{item}</List.Item>}
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
            <Input
              placeholder="汇率"
              value={exchangeRate.toString()}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
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
            <div>货币一览</div>
          </Col>
          <Col span={24}>
            <List
              bordered
              dataSource={currencies.map(
                (item) =>
                  `${item.name}: 1 ${baseCurrency} = ${item.rate} ${item.name}`
              )}
              renderItem={(item) => <List.Item>{item}</List.Item>}
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
          <Col span={12}>
            <Input
              placeholder="收支内容"
              value={transactionDescription}
              onChange={(e) => setTransactionDescription(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Input
              placeholder="金额"
              value={transactionAmount.toString()}
              onChange={(e) => setTransactionAmount(parseFloat(e.target.value))}
            />
          </Col>
          <Col span={4}>
            <Select
              value={transactionCurrency}
              onChange={(value) => setTransactionCurrency(value)}
              placeholder="选择货币"
              options={currencies.map((currency) => ({
                label: currency.name,
                value: currency.name,
              }))}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" block onClick={handleAddTransaction}>
              添加
            </Button>
          </Col>
          <Col span={24}>
            <div className="title">收支内容一览</div>
          </Col>
          <Col span={24}>
            <List
              bordered
              dataSource={transactions.map(
                (item) => `${item.description}: ${item.amount} ${item.currency}`
              )}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Col>
        </Row>
      </div>

      {/* 显示结果 */}
      <div className="section-container">
        <Row gutter={[16, 16]} className="row">
          <Col span={24}>
            <div className="title">费用分摊结果</div>
          </Col>
          <Col span={24}>
            <Table />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Calculator;
