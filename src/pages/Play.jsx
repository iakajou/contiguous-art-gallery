import React from 'react';
import GameWidget from '../widgets/GameWidget.jsx';
import { M } from '../components/ui.jsx';

export default function Play() {
  return (
    <div className="page-play">
      <section className="page-hero page-hero-compact">
        <div className="wrap">
          <div className="eyebrow">Play</div>
          <h1>Guard the gallery <em>yourself</em></h1>
          <p className="page-lead">
            Place cameras, give each one a single stretch of wall, and cover every wall. When you are done, the game checks your solution and compares
            it with the optimum <M>k</M> computed by the algorithm. In the sandbox you can draw your own galleries.
          </p>
          <div className="howto">
            <div><b>1</b> Click inside the gallery to place a camera.</div>
            <div><b>2</b> Click a wall to give it the stretch it sees there.</div>
            <div><b>3</b> Cover every wall, then press <em>Check</em>.</div>
          </div>
        </div>
      </section>
      <section className="wrap wrap-wide">
        <GameWidget />
      </section>
    </div>
  );
}
