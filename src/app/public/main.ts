console.log("testing testing");

fetch("http://localhost:3000/api/data/accounts")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data);
    });