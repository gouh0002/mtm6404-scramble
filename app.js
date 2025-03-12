/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle(src) {
  const copy = [...src];

  const length = copy.length;
  for (let i = 0; i < length; i++) {
    const x = copy[i];
    const y = Math.floor(Math.random() * length);
    const z = copy[y];
    copy[i] = z;
    copy[y] = x;
  }

  if (typeof src === "string") {
    return copy.join("");
  }

  return copy;
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

// Render the game
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ScrambleGame />);

// List of world capitals
const worldCapitals = [
  "Tokyo",
  "Paris",
  "London",
  "Berlin",
  "Madrid",
  "Rome",
  "Ottawa",
  "Beijing",
  "Moscow",
];

//Main Component
function ScrambleGame() {
  const maxStrikes = 3;
  // Load game state from localStorage OR default values
  const [words, setWords] = React.useState(
    JSON.parse(localStorage.getItem("words")) || [...worldCapitals]
  );
  const [originalWord, setOriginalWord] = React.useState(
    localStorage.getItem("originalWord") || words[0]
  );
  const [currentWord, setCurrentWord] = React.useState(
    localStorage.getItem("currentWord") || shuffle(words[0])
  );
  const [guess, setGuess] = React.useState("");
  const [points, setPoints] = React.useState(
    Number(localStorage.getItem("points")) || 0
  );
  const [strikes, setStrikes] = React.useState(
    Number(localStorage.getItem("strikes")) || 0
  );
  const [passes, setPasses] = React.useState(
    Number(localStorage.getItem("passes")) || 3
  );
  // set feedback based on game state
  const [feedback, setFeedback] = React.useState(getFeedback());

  // Handle player's guess
  function validateGuess() {
    if (guess.toLowerCase() === originalWord.toLowerCase()) {
      const newPoints = points + 1;
      setPoints(newPoints);
      moveToNextWord();
      setFeedback(getFeedback("WIN"));
    } else {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setFeedback(getFeedback("FAIL"));
    }

    updateLocalStorage(
      words,
      originalWord,
      currentWord,
      points,
      strikes,
      passes
    );
    setGuess("");
  }

  // Move to the next word
  function moveToNextWord() {
    if (words.length > 1) {
      const remainingWords = words.filter((word) => word !== originalWord);
      const nextWord = remainingWords[0];
      setWords(remainingWords);
      setOriginalWord(nextWord);
      setCurrentWord(shuffle(nextWord));
    }
  }

  // Pass to the next word
  function skipToNextWord() {
    if (passes > 0) {
      const newPasses = passes - 1;
      setPasses(newPasses);
      setFeedback("PASS");
      moveToNextWord();
    }
  }

  // Handle when the game is over to get proper feedback
  function getFeedback(feedback) {
    if (strikes + 1 >= maxStrikes) return "OVER_FAIL";
    if (words.length === 1 && "WIN" === feedback) return "OVER_WIN";
    return feedback;
  }

  // Restart the game
  function restartGame() {
    setWords([...worldCapitals]);
    setOriginalWord(worldCapitals[0]);
    setCurrentWord(shuffle(worldCapitals[0]));
    setPoints(0);
    setStrikes(0);
    setPasses(3);
    setFeedback("");
    localStorage.clear();
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg w-50">
        <div className="card-body text-center">
          <h1 className="card-title">Welcome to Scramble.</h1>
          <div className="card-text">
            <ScoreComponent points={points} strikes={strikes} />
            <FeedbackComponent feedback={feedback} />
            <GameComponent
              currentWord={currentWord}
              guess={guess}
              setGuess={setGuess}
              handleGuess={validateGuess}
              handlePass={skipToNextWord}
              passes={passes}
              gameOver={feedback === "OVER_WIN" || feedback === "OVER_FAIL"}
              restartGame={restartGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreComponent({ points, strikes }) {
  return (
    <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
      <div className="mb-0">
        <strong className="fs-2">{points}</strong>
        <p className="text-uppercase" style={{ fontSize: "0.8rem" }}>
          points
        </p>
      </div>
      <div className="mb-0">
        <strong className="fs-2">{strikes}</strong>
        <p className="text-uppercase" style={{ fontSize: "0.8rem" }}>
          strikes
        </p>
      </div>
    </div>
  );
}

function FeedbackComponent({ feedback }) {
  const feedbackStyles = {
    PASS: { message: "⚠ You skipped. Next word.", class: "alert-warning" },
    WIN: { message: "✅ Correct! Next word.", class: "alert-success" },
    FAIL: { message: "❌ Wrong. Try again.", class: "alert-danger" },
    OVER_WIN: { message: "🎉 You won! Game Over.", class: "alert-info" },
    OVER_FAIL: { message: "😩 You lost! Game Over.", class: "alert-secondary" },
  };

  if (!feedback || !feedbackStyles[feedback]) return null;

  return feedback ? (
    <div
      className={`alert ${feedbackStyles[feedback].class} mt-3 fw-bold`}
      role="alert"
    >
      {feedbackStyles[feedback].message}
    </div>
  ) : null;
}

function GameComponent(props) {
  const {
    currentWord,
    guess,
    setGuess,
    handleGuess,
    handlePass,
    passes,
    gameOver,
    restartGame,
  } = props;
  return (
    <>
      <p className="fs-1 text-uppercase">{currentWord}</p>
      <div className="d-flex flex-column gap-3 align-items-center justify-content-center mt-3">
        <input
          className="form-control w-100 text-uppercase"
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGuess()}
          disabled={gameOver}
        />
        <button
          className="btn btn-danger position-relative"
          onClick={handlePass}
          disabled={passes <= 0 || gameOver}
        >
          <span className="badge badge-circle bg-white text-dark me-1">
            {passes}
          </span>
          Passes Remaining
        </button>

        {gameOver && (
          <button className="btn btn-primary" onClick={restartGame}>
            Play, Again?
          </button>
        )}
      </div>
    </>
  );
}

// **Helper function**: Update localStorage manually whenever state changes
function updateLocalStorage(
  updatedWords,
  newOriginalWord,
  newCurrentWord,
  newPoints,
  newStrikes,
  newPasses
) {
  localStorage.setItem("words", JSON.stringify(updatedWords));
  localStorage.setItem("originalWord", newOriginalWord);
  localStorage.setItem("currentWord", newCurrentWord);
  localStorage.setItem("points", newPoints);
  localStorage.setItem("strikes", newStrikes);
  localStorage.setItem("passes", newPasses);
}
