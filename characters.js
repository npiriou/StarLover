let names = [];
function fetchCharacters() {
  const url = `https://miadil.github.io/starwars-api/api/all.json`;
  axios
    .get(url)
    .then((res) => res.data)
    .then(function (data) {
      names = data.map((nameCharacter) => nameCharacter.name);
      return data;
    });
}

fetchCharacters();
