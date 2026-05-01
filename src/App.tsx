import { useEffect, useState } from "react";

export default function App() {
  
  const [detailedPokemon, setDetailedPokemon] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const [typeFilter, setTypeFilter] = useState("all");

  const [favorites, setFavorites] = useState<number[]>(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);

  // Open modal
  const openPokemon = (p: any) => {
    setSelectedPokemon(p);
  };

  // Fetch Pokémon list + details
  const fetchPokemon = async () => {
    setLoading(true);

    const offset = page * limit;

    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );

    const data = await res.json();

    const detailed = await Promise.all(
      data.results.map(async (p: any) => {
        const res = await fetch(p.url);
        const details = await res.json();

        return {
          name: p.name,
          id: details.id,
          types: details.types.map((t: any) => t.type.name),
        };
      })
    );

    setDetailedPokemon(detailed);
    setLoading(false);
  };

  useEffect(() => {
    fetchPokemon();
  }, [page]);

  // Search + filter
  const filteredPokemon = detailedPokemon.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "all" || p.types.includes(typeFilter);

    return matchesSearch && matchesType;
  });

  // Favorites toggle
  const toggleFavorite = (id: number) => {
    let updated;

    if (favorites.includes(id)) {
      updated = favorites.filter((f) => f !== id);
    } else {
      updated = [...favorites, id];
    }

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>⚡ Pokedex Lite</h1>

      {loading && <p>Loading Pokémon...</p>}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search Pokémon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          maxWidth: "300px",
          marginTop: "10px",
          border: "1px solid gray",
          borderRadius: "5px",
        }}
      />

      {/* FILTER */}
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        style={{ padding: "10px", marginTop: "10px" }}
      >
        <option value="all">All Types</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="grass">Grass</option>
        <option value="electric">Electric</option>
        <option value="bug">Bug</option>
      </select>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        {filteredPokemon.map((p) => (
          <div
            key={p.id}
            onClick={() => openPokemon(p)}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "10px",
              textAlign: "center",
              background: "white",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
              alt={p.name}
            />

            <p style={{ textTransform: "capitalize", fontWeight: "bold" }}>
              {p.name}
            </p>

            <p style={{ fontSize: "12px" }}>{p.types.join(", ")}</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(p.id);
              }}
            >
              {favorites.includes(p.id) ? "❤️" : "🤍"}
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
        >
          Previous
        </button>

        <button onClick={() => setPage((prev) => prev + 1)}>
          Next
        </button>
      </div>

      {/* MODAL */}
      {selectedPokemon && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setSelectedPokemon(null)}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ textTransform: "capitalize" }}>
              {selectedPokemon.name}
            </h2>

            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`}
            />

            <p>ID: {selectedPokemon.id}</p>

            <p>{selectedPokemon.types.join(", ")}</p>

            <button onClick={() => setSelectedPokemon(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}