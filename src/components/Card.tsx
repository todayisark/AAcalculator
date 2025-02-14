import { Card as AntdCard } from "antd";
import { CardProps as AntdCardProps } from "antd/es/card";

type CardProps = {
  // Props for the Card component
};

const Card: React.FC<CardProps & AntdCardProps> = ({ children, ...props }) => {
  return (
    <div
      style={{
        boxShadow: " 0 0 10px rgba(0, 0, 0, 0.1)",
        marginBottom: "20px",
      }}
    >
      <AntdCard {...props}>{children}</AntdCard>
    </div>
  );
};

export default Card;
