import InfoPage from "../../components/layout/InfoPage/InfoPage";

export default function Terms() {
  return (
    <InfoPage
      icon="gavel"
      title="Terms of Service"
      intro="The ground rules for hosting and playing on Quizvora."
      updated="2026"
      sections={[
        {
          heading: "Using Quizvora",
          body: (
            <p>
              You can host quizzes with an account or as a guest, and join any
              room with a room code. You are responsible for the content of the
              quizzes you create and for keeping your login details safe.
            </p>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <ul>
              <li>Do not post unlawful, hateful or harmful questions or answers.</li>
              <li>Do not disrupt rooms, cheat the leaderboard or abuse the service.</li>
              <li>Do not impersonate other people when choosing a display name.</li>
            </ul>
          ),
        },
        {
          heading: "Guest sessions",
          body: (
            <p>
              Guest profiles are temporary. They may expire, and the quizzes and
              scores tied to them may no longer be available afterwards. Create
              an account to keep your history.
            </p>
          ),
        },
        {
          heading: "Changes and termination",
          body: (
            <p>
              We may update these terms and may suspend accounts that break
              them. Continuing to use Quizvora after a change means you accept
              the updated terms.
            </p>
          ),
        },
      ]}
    />
  );
}
