import InfoPage from "../../components/layout/InfoPage/InfoPage";

export default function Safety() {
  return (
    <InfoPage
      icon="health_and_safety"
      title="Safety"
      intro="Keeping every room fun and respectful."
      sections={[
        {
          heading: "Hosting safely",
          body: (
            <ul>
              <li>Share room codes only with the people you want in the game.</li>
              <li>End the room when the quiz is over so the code stops working.</li>
            </ul>
          ),
        },
        {
          heading: "Playing safely",
          body: (
            <ul>
              <li>Pick a display name that does not reveal personal information.</li>
              <li>Never share your password. Quizvora staff will never ask for it.</li>
            </ul>
          ),
        },
        {
          heading: "Reporting a problem",
          body: (
            <p>
              If a quiz or player is behaving badly, leave the room and contact
              support with the room code so we can look into it.
            </p>
          ),
        },
      ]}
    />
  );
}
