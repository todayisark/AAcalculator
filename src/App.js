import React from "react";
import { Layout } from "antd";
import Calculator from "./pages/calculator";

function App() {
  return (
    <Layout>
      <Layout.Header>
        <div style={{ color: "white", fontSize: "20px" }}>费用分摊计算器</div>
      </Layout.Header>
      <Calculator />
      <Layout.Footer>
        <p>
          © 2025 费用分摊计算器 Open-source on
          <a
            href="https://github.com/todayisark/AAcalculator"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </Layout.Footer>
    </Layout>
  );
}

export default App;
