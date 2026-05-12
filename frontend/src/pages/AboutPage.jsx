export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="page-hero" style={{ alignItems: "flex-start", textAlign: "left", maxWidth: "44rem" }}>
        <div className="eyebrow">About</div>
        <h1 className="page-title" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>SpeedRace</h1>
        <p className="page-copy" style={{ marginTop: "1.5rem" }}>
          SpeedRace is an interactive visualization of global broadband speeds,
          built on real-world data from Ookla's Speedtest Global Index. A user can select
          up to five countries on the world map, set a file size, and watch them
          race in real time where each country's bar advances at a pace proportional
          to its median download speed towards completing the file download.
        </p>
        <p className="page-copy" style={{ marginTop: "1rem" }}>
          The project shows how digital infrastructure is distributed across the world. A file that downloads in seconds in one country can take minutes in another. Additionally, this gap affects access to
          education, remote work, and public services. SpeedRace is a project designed to highlight this disparity
          into something you can see, feel, and think critically about.
        </p>
        <p className="page-copy" style={{ marginTop: "1rem" }}>
          SpeedRace asks what it would mean to experience internet
          inequality rather than just read about it. Mbps figures are opaque on
          their own, but watching one country's bar crawl while another finishes
          makes the disparity immediate and felt. The race metaphor is
          intentional to frame broadband access as a competition that most
          countries never agreed to enter on equal footing. 
        </p>
        <p className="page-copy" style={{ marginTop: "1rem" }}>
          Technically, the project is a React and Vite single-page application (SPA). The world map is
          rendered as an SVG, with each country's fill color determined by Ookla Speedtest Global Index median download data mapped to a blue-intensity scale. A user can then select up to five countries and hand them off to
          a race engine that calculates how long each would take to transfer a
          chosen file size: time&nbsp;=&nbsp;(size&nbsp;×&nbsp;8)&nbsp;÷&nbsp;speed and animates their progress bars in real time using
          <code style={{ fontFamily: "inherit", fontSize: "inherit" }}> requestAnimationFrame</code>.
        </p>
        <p className="page-copy" style={{ marginTop: "1rem" }}>
          Furthermore, the Speed Test page probes Cloudflare's public
          measurement API across multiple payload sizes to compute the actual
          download, upload, and ping, then submits the result to a Node.js
          backend and then the reading feeds back into the country averages over
          time.
        </p>
      </div>
    </div>
  );
}
