import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function PurchaseCart({ onClose }){
  const [items, setItems] = useState([]);
  useEffect(()=>{
    const handler = (e) => {
      const v = e.detail.vehicle;
      setItems(it => {
        const exists = it.find(x=>x.vehicle.id===v.id);
        if(exists) return it.map(x=> x.vehicle.id===v.id ? { ...x, qty: x.qty+1 } : x);
        return [...it, { id: uuidv4(), vehicle: v, qty: 1 }];
      });
    };
    window.addEventListener('addToCart', handler);
    return ()=>window.removeEventListener('addToCart', handler);
  },[]);

  function changeQty(id, n){
    setItems(it=> it.map(x=> x.id===id ? { ...x, qty: Math.max(1, x.qty + n)} : x));
  }

  function submitOrder(){
    const order = { id: uuidv4(), createdAt: new Date().toISOString(), items };
    // in demo we just show confirmation
    alert('订单已提交（示例）\n' + JSON.stringify(order, null, 2));
    setItems([]);
    onClose();
  }

  return (
    <div className="cart-modal">
      <h2>采购车单</h2>
      {items.length===0 ? <div>车单为空，请在车辆列表点击“加入采购车单”</div> : (
        <div>
          <ul>
            {items.map(it=>(
              <li key={it.id}>
                {it.vehicle.make} {it.vehicle.model} — 单价 ¥{it.vehicle.price} x {it.qty}
                <div>
                  <button onClick={()=>changeQty(it.id, -1)}>-</button>
                  <button onClick={()=>changeQty(it.id, 1)}>+</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-actions">
            <button onClick={submitOrder}>提交订单（示例）</button>
            <button onClick={onClose}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}
