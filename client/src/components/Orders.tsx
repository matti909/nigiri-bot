import { useEffect } from "react";
import { useChatbot } from "../hooks";
import { addOrder, fetchOrders } from "../store/features/ordersSlice";
import { useAppDispatch, useAppSelector } from "../store/hook";
import { calculateTotal } from "../utils";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Props = {
  error?: string;
  order: OrderItem[] | null;
};

export const Orders = ({ order }: Props) => {
  const { orderList, loading, error2 } = useAppSelector(
    (state) => state.employeeKey
  );
  const dispatch = useAppDispatch();
  const { error } = useChatbot();

  console.log(orderList);

  useEffect(() => {
    dispatch(fetchOrders()).unwrap();
  }, [dispatch]);

  const handleOrderSubmit = (e: React.FormEvent) => {
    //submitOrder(order, uri);
    e.preventDefault();
    dispatch(addOrder(order!));
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
            className={`px-4 py-2 mt-4 text-white rounded-lg transition 
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sushi-accent hover:bg-sushi-accent/90"
            }
          `}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Pedido"}
          </button>
        </div>
      )}

      {/* submit orders */}
      <section className="p-4 mt-4 rounded-lg border border-border">
        {error2 && <p className="text-sm text-red-500">{error2}</p>}
        {orderList?.length ? (
          <div className="mt-2">
            <h3 className="text-lg font-bold text-sushi-paper">
              Pedidos pendientes
            </h3>
            <ul className="mt-2 space-y-2 text-sushi-text">
              {orderList.map((order, index) => (
                <li key={index}>
                  <h4>
                    {order.items.map((item) => (
                      <div key={item.id}>{item.details.name}</div>
                    ))}
                  </h4>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay órdenes disponibles.</p>
        )}
      </section>
    </div>
  );
};
