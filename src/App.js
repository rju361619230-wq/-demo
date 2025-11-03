import React, { useEffect, useState } from 'react';
import data from './mock/data.json';
import AuctionModal from './components/AuctionModal';
import PurchaseCart from './components/PurchaseCart';

function App(){
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(()=>{
    // load mock data
    setVehicles(data.vehicles);
  },[]);

  const openDetails = (v) => {
    setSelected(v);
  };

  const toggleCart = () => setCartOpen(!cartOpen);

  const updateVehicle = (updated) => {
    setVehicles(vs => vs.map(v => v.id === updated.id ? updated : v));
    if(selected && selected.id === updated.id) setSelected(updated);
  };

  return (
    <div className="container">
      <header>
        <h1>Demo 经销商平台</h1>
        <div className="header-actions">
          <button onClick={toggleCart}>查看采购车单</button>
        </div>
      </header>

      <main>
        <aside className="list">
          <h2>车辆列表</h2>
          {vehicles.map(v=>(
            <div className="card" key={v.id}>
              <img src={v.image} alt="" />
              <div className="info">
                <div className="title">{v.make} {v.model}</div>
                <div>年份: {v.year} | 行驶: {v.mileage} km</div>
                <div className="price">¥{v.price}</div>
                <div className="actions">
                  <button onClick={()=>openDetails(v)}>查看/出价</button>
                  <button onClick={()=>{
                    // add to cart (emit event)
                    const ev = new CustomEvent('addToCart', { detail: { vehicle: v }});
                    window.dispatchEvent(ev);
                    alert('已加入采购车单（示例）');
                  }}>加入采购车单</button>
                </div>
              </div>
            </div>
          ))}
        </aside>

        <section className="detail">
          {selected ? (
            <AuctionModal vehicle={selected} onUpdate={updateVehicle} />
          ) : (
            <div className="placeholder">请选择一辆车查看详情与操作</div>
          )}
        </section>
      </main>

      <footer>示例数据仅供演示，不涉及真实交易。</footer>

      { cartOpen && <PurchaseCart onClose={toggleCart} /> }
    </div>
  );
}

export default App;
