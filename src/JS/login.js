const login = (e) => {
	e.preventDefault();
	const email = document.getElementById("username").value;
	const password = document.getElementById("password").value;
	firebase
		.auth()
		.signInWithEmailAndPassword(email, password)
		.then(() => {
			window.location.href = "./src/auth/restricted.html";
		})
		.catch((error) => {
			var errorCode = error.code;
			var errorMessage = error.message;
			document.getElementById(
				"errorMessage"
			).innerHTML = `<p class="text-red-500 text-xs italic">Username and password don´t match.</p>`;
		});
};

document.getElementById("loginForm").addEventListener("submit", login);
