import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

export default function AuctionModal({ vehicle, onUpdate }){
  const [bids, setBids] = useState(vehicle.auction?.bids || []);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState(vehicle.auction?.status || 'ready'); // ready, live, ended

  useEffect(()=>{
    setBids(vehicle.auction?.bids || []);
    setStatus(vehicle.auction?.status || 'ready');
    if(vehicle.auction && vehicle.auction.endsAt){
      const end = dayjs(vehicle.auction.endsAt);
      const timer = setInterval(()=>{
        const diff = end.diff(dayjs());
        if(diff <= 0){
          clearInterval(timer);
          // determine winner
          setStatus('ended');
          handleEnd();
        } else {
          setTimeLeft(diff);
        }
      }, 500);
      return ()=>clearInterval(timer);
    }
  },[vehicle]);

  function formatTime(ms){
    if(ms === null) return '';
    const s = Math.floor(ms/1000);
    const m = Math.floor(s/60);
    const sec = s%60;
    return `${m}m ${sec}s`;
  }

  function submitBid(){
    const amt = Number(bidAmount);
    if(!amt || amt <= 0){ alert('请输入有效出价'); return; }
    // simple rule: must be greater than current highest
    const highest = bids.length ? Math.max(...bids.map(b=>b.amount)) : vehicle.startPrice;
    if(amt <= highest){ alert('出价必须高于当前最高价'); return; }
    const newBid = { id: uuidv4(), bidder: 'Demo 买家', amount: amt, time: new Date().toISOString() };
    const newBids = [...bids, newBid];
    setBids(newBids);
    setBidAmount('');
    // update parent vehicle data (simulate saving)
    const updated = { ...vehicle, auction: { ...vehicle.auction, bids: newBids, status: 'live' } };
    onUpdate(updated);
  }

  function handleEnd(){
    if(bids.length === 0){
      alert('拍卖结束：无人出价');
      const updated = { ...vehicle, auction: { ...vehicle.auction, status: 'ended' } };
      onUpdate(updated);
      return;
    }
    const winner = bids.reduce((a,b)=> a.amount > b.amount ? a : b);
    alert(`拍卖结束！中标者：${winner.bidder}，价格 ¥${winner.amount}`);
    const updated = { ...vehicle, auction: { ...vehicle.auction, status: 'ended', winner } };
    onUpdate(updated);
  }

  return (
    <div className="modal">
      <h2>{vehicle.make} {vehicle.model} — 详情</h2>
      <img src={vehicle.image} alt="" style={{maxWidth:300}}/>
      <p>VIN: {vehicle.vin}</p>
      <p>年份: {vehicle.year} | 行驶: {vehicle.mileage} km</p>
      <p>起拍价：¥{vehicle.startPrice}  当前价：¥{bids.length ? Math.max(...bids.map(b=>b.amount)) : vehicle.startPrice}</p>

      { vehicle.auction && vehicle.auction.status !== 'ended' && (
        <div className="auction-panel">
          <div>拍卖状态：{status} {timeLeft ? `｜剩余：${formatTime(timeLeft)}` : ''}</div>
          <div className="bid-input">
            <input placeholder="出价金额（¥）" value={bidAmount} onChange={e=>setBidAmount(e.target.value)} />
            <button onClick={submitBid}>提交出价</button>
          </div>
          <h4>出价记录</h4>
          <ul className="bids">
            {bids.slice().reverse().map(b=>(
              <li key={b.id}>{b.bidder} — ¥{b.amount} （{new Date(b.time).toLocaleString()}）</li>
            ))}
          </ul>
        </div>
      )}

      { vehicle.auction && vehicle.auction.status === 'ended' && vehicle.auction.winner && (
        <div className="result">
          <h3>中标信息</h3>
          <p>中标者：{vehicle.auction.winner.bidder}</p>
          <p>成交价：¥{vehicle.auction.winner.amount}</p>
        </div>
      )}
    </div>
  );
}
