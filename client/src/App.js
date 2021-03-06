import React, { useCallback, useState } from "react";

import "./App.css";
import DomainInput from "./DomainInput";
import Loading from "./Loading";
import ResultSet from "./ResultSet";
import ErrorMessage from "./ErrorMessage";

function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const runValidation = useCallback(
    async domain => {
      setLoading(true);
      setResults(null);
      setErrorMessage(null);
      try {
        console.log("Lets re-ask");
        const evtSource = new EventSource(
          `${process.env.REACT_APP_API_HOST || ""}/run?domain=${domain}`
        );
        evtSource.addEventListener("message", event => {
          const message = JSON.parse(event.data);
          if (message.loadingMessage) {
            setLoadingMessage(message.loadingMessage);
          } else if (message.results) {
            setResults(message.results);
            setLoading(false);
          }
        });

        evtSource.onerror = e => {
          console.log(e);
          evtSource.close();
          setErrorMessage("Something went wrong");
        };
      } catch (e) {
        console.log(e);
        setErrorMessage("Something went wrong");
        setLoading(false);
      }
    },
    [setLoading, setLoadingMessage, setResults, setErrorMessage]
  );

  return (
    <div className="App">
      <DomainInput onValidateClick={runValidation} isLoading={isLoading} />
      <Loading active={isLoading} message={loadingMessage} />
      <ResultSet results={results} />
      <ErrorMessage message={errorMessage} />
    </div>
  );
}

export default App;
