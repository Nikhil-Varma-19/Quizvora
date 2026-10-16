import { Link } from "react-router";
import InfoPage from "../../components/layout/InfoPage/InfoPage";

export default function Help() {
  return (
    <InfoPage
      icon="help"
      title="Help Center"
      intro="Quick answers for hosts and players."
      sections={[
        {
          heading: "How do I join a quiz?",
          body: (
            <p>
              Ask the host for the room code, open the{" "}
              <Link to="/join">join page</Link>, enter a display name and then
              the code. No account needed.
            </p>
          ),
        },
        {
          heading: "How do I host a quiz?",
          body: (
            <p>
              Go to <Link to="/host">Create quiz</Link>. Pick Predefined mode to
              write every question first, or Live mode to write them as you go.
              Questions can be multiple choice or written answers.
            </p>
          ),
        },
        {
          heading: "Do I need an account to host?",
          body: (
            <p>
              No. Guests can host too, but an account keeps your history. You
              can <Link to="/register">sign up free</Link> any time.
            </p>
          ),
        },
        {
          heading: "I forgot my password",
          body: (
            <p>
              Use <Link to="/forgot-password">Forgot password</Link>. We email a
              reset link that works once and expires in 10 minutes.
            </p>
          ),
        },
      ]}
    />
  );
}
