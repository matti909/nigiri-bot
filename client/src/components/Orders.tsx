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
  const calculateTotal = (items: OrderItem[]) =>
    items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {error && <p className="mt-2 text-red-500">Error: {error}</p>}
      {order && (
        <div className="p-2 mt-4 bg-gray-100 rounded border">
          <h3 className="font-bold text-black">Detalles del Pedido:</h3>
          <ul className="text-black">
            {order.map((item, index) => (
              <li key={index}>
                - {item.name} (x{item.quantity}): ${item.price * item.quantity}
                (${item.price.toFixed(2)} c/u)
              </li>
            ))}
          </ul>
          <p className="mt-2 font-bold">
            Total: ${calculateTotal(order).toFixed(2)}
          </p>
        </div>
      )}
    </>
  );
};
