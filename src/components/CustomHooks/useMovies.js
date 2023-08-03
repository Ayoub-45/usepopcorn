import { useState, useEffect } from "react";
export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const KEY = "5d651a66";
    useEffect(
        function () {
            const controller = new AbortController();
            async function fetchMovies() {
                setError("");
                setIsLoading(true);
                try {
                    const res = await fetch(
                        `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
                        { signal: controller.signal }
                    );
                    if (!res.ok)
                        throw new Error(
                            "Something went wrong ! failed to fetch Movies"
                        );
                    const data = await res.json();
                    if (data.Response === "False")
                        throw new Error("Movie not found");
                    else {
                        setMovies(data.Search);
                        setError("");
                    }
                } catch (err) {
                    if (err.name !== "AbortError") setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            }
            if (query.length < 3) {
                setMovies([]);
                setError("");
                return;
            }
            //handleCloseMovie();
            fetchMovies();
            return function () {
                controller.abort();
            };
        },
        [query]
    );
    return { movies, isLoading, error };
}
