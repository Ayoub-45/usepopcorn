import { useEffect, useRef, useState } from "react";
import { StarRating } from "./StarRating";
const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => (acc + cur) / arr.length, 0);
const KEY = "5d651a66";
export default function App() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    //const [watched, setWatched] = useState([]);
    const [watched, setWatched] = useState(function () {
        const storedValue = localStorage.getItem("watched");
        return JSON.parse(storedValue);
    });

    function handleSelectMovie(id) {
        setSelectedMovieId((selectedId) => (selectedId === id ? null : id));
    }
    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);
        //   localStorage.setItem("watched",JSON.stringify([...watched,movie]))
    }

    function handleCloseMovie() {
        setSelectedMovieId(null);
    }
    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    }
    useEffect(
        function () {
            localStorage.setItem("watched", JSON.stringify(watched));
        },
        [watched]
    );
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
            handleCloseMovie();
            fetchMovies();
            return function () {
                controller.abort();
            };
        },
        [query]
    );

    return (
        <>
            <NavBar>
                <SearchForMovie query={query} setQuery={setQuery} />
                <NumResults movies={movies} />
            </NavBar>
            <Main>
                <Box>
                    {/*isLoading ? <Loader /> : <ListMovies movies={movies} />*/}
                    {isLoading && <Loader />}
                    {!isLoading && !error && (
                        <ListMovies
                            movies={movies}
                            onSelectMovie={handleSelectMovie}
                        />
                    )}
                    {error && <ErrorMessage message={error} />}
                </Box>

                <Box>
                    {selectedMovieId ? (
                        <MovieDetails
                            selectedMovieId={selectedMovieId}
                            onCloseMovie={handleCloseMovie}
                            onAddWatched={handleAddWatched}
                            watched={watched}
                        />
                    ) : (
                        <>
                            <SummaryWatchedMovies watched={watched} />
                            <ListWatchedMovies
                                watched={watched}
                                onDeleteWatched={handleDeleteWatched}
                            />
                        </>
                    )}
                </Box>
            </Main>
        </>
    );
}
function ErrorMessage({ message }) {
    return <p className="error">{message}</p>;
}
function Loader() {
    return <p className="loader">Loading...</p>;
}
function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    );
}
function Main({ children }) {
    return <main className="main">{children}</main>;
}
function ListMovies({ movies, onSelectMovie }) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie
                    movie={movie}
                    key={movie.imdbID}
                    onSelectMovie={onSelectMovie}
                />
            ))}
        </ul>
    );
}
function MovieDetails({
    watched,
    selectedMovieId,
    onCloseMovie,
    onAddWatched,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [movie, setMovie] = useState({});
    const [userRating, setUserRating] = useState("");
    const countRef = useRef(0);
    useEffect(
        function () {
           if(userRating) countRef.current = countRef.current + 1;
            
        },
        [userRating]
    );
    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie;
    function handleAdd() {
        const newWatchedMovie = {
            imdbID: selectedMovieId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(" ").at(0)),
            userRating,
            countRatingDecisions:countRef.current
        };
        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }
    const isWatched = watched
        .map((movie) => movie.imdbID)
        .includes(selectedMovieId);
    const watchedUserRating = watched.find(
        (movie) => movie.imdbID === selectedMovieId
    )?.userRating;
    useEffect(
        function () {
            async function getMovieDetails() {
                setIsLoading(true);
                const res = await fetch(
                    `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovieId}`
                );
                const data = await res.json();
                setMovie(data);
                setIsLoading(false);
            }
            getMovieDetails();
        },
        [selectedMovieId]
    );
    useEffect(
        function () {
            if (!title) return;
            document.title = `Movie | ${title}`;
            return function () {
                document.title = "usePopcorn";
            };
        },
        [title]
    );
    useEffect(
        function () {
            function callback(e) {
                if (e.code === "Escape") {
                    console.log("CLOSING");
                    onCloseMovie();
                }
            }
            document.addEventListener("keydown", callback);
            return function () {
                document.addEventListener("keydown", callback);
            };
        },
        [onCloseMovie]
    );
    return (
        <div className="details">
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header>
                        <button onClick={onCloseMovie} className="btn-back">
                            &larr;
                        </button>
                        <img src={poster} alt={`Poster of ${title}`} />
                        <div className="details-overview">
                            <h2>{title}</h2>
                            <p>
                                {released} &bull; {year} {runtime}
                            </p>
                            <p>{genre}</p>
                            <p>
                                <span>⭐</span>
                                {imdbRating} IMDB rating
                            </p>
                        </div>
                    </header>
                    <div className="rating">
                        {!isWatched ? (
                            <>
                                <StarRating
                                    size={24}
                                    maxRating={10}
                                    onSetRating={setUserRating}
                                />
                                {Number(userRating) > 0 && (
                                    <button
                                        className="btn-add"
                                        onClick={handleAdd}
                                    >
                                        Add to list
                                    </button>
                                )}
                            </>
                        ) : (
                            <p>
                                You already rated this movie with{" "}
                                {watchedUserRating}
                                <span>⭐</span>
                            </p>
                        )}
                    </div>
                    <section>
                        <p>
                            <em>{plot}</em>
                        </p>
                        <p>Starring {actors}</p>
                        <p>Directed by {director}</p>
                    </section>
                </>
            )}
        </div>
    );
}
function Movie({ movie, onSelectMovie }) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    );
}
function SummaryWatchedMovies({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));
    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime.toFixed(2)} min</span>
                </p>
            </div>
        </div>
    );
}

function ListWatchedMovies({ onDeleteWatched, watched }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <MovieWatched
                    movie={movie}
                    key={movie.imdbID}
                    onDeleteWatched={onDeleteWatched}
                />
            ))}
        </ul>
    );
}
function MovieWatched({ movie, onDeleteWatched }) {
    return (
        <li>
            <img src={movie.poster} alt={`${movie.title} poster`} />
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
                <button
                    className="btn-delete"
                    onClick={() => onDeleteWatched(movie.imdbID)}
                >
                    X
                </button>
            </div>
        </li>
    );
}
function SearchForMovie({ query, setQuery }) {
    const inputEl = useRef(null);
    useEffect(
        function () {
            function callback(e) {
                if (e.code === "Enter") {
                    if (document.activeElement === inputEl.current) return;
                    inputEl.current.focus();
                    setQuery("");
                }
            }
            document.addEventListener("keydown", callback);
            return function () {
                document.addEventListener("keydown", callback);
            };
        },
        [setQuery]
    );
    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputEl}
        />
    );
}
function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}
function NumResults({ movies }) {
    return (
        <p className="num-results">
            Found <strong>{movies.length}</strong> results
        </p>
    );
}
function NavBar({ children }) {
    return (
        <nav className="nav-bar">
            {" "}
            <Logo /> {children}
        </nav>
    );
}
