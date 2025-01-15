import { calculateTotal, submitOrder } from "../utils";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Props = {
  error: string;
  order: OrderItem[] | null;
};

export const Orders = ({ error, order }: Props) => {
  const uri = "http://localhost:4000/order";

  const handleOrderSubmit = () => {
    submitOrder(order, uri);
  };

  return (
    <div className="mt-6 w-full max-w-md">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {order && (
        <div className="p-4 rounded-lg border border-border bg-background">
          <h3 className="text-lg font-bold text-sushi-paper">
            Detalles del Pedido
          </h3>
          <ul className="mt-2 space-y-2 text-sushi-text">
            {order.map((item, index) => (
              <li key={index}>
                - {item.name} (x{item.quantity}): $
                {(item.price * item.quantity).toFixed(2)} ($
                {item.price.toFixed(2)} c/u)
              </li>
            ))}
          </ul>
          <p className="mt-4 font-bold text-sushi-paper">
            Total: ${calculateTotal(order).toFixed(2)}
          </p>
          <button
            onClick={handleOrderSubmit}
            className="px-4 py-2 mt-4 text-white rounded-lg transition bg-sushi-accent hover:bg-sushi-accent/90"
          >
            Enviar Pedido
          </button>
        </div>
      )}
    </div>
  );
};
