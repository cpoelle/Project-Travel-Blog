const userBar = document.getElementById("userNavBar");

firebase.auth().onAuthStateChanged((user) => {
	if (user) {
		showUserUi(user);
	} else {
		window.location.href = "../../index.html";
	}
});

const showUserUi = (userData) => {
	userBar.innerHTML = `
		<div class="hidden md:flex md:items-center">
			<a href="../../admin.html" class="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white">
			Admin Area
			</a>
			<button onclick="logout()" class="mx-3 inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white">
				Logout
			</button>
			<div class="flex flex-col items-center">
				<img class="inline-block w-12 h-12 md:w-14 md:h-14 rounded-full" src="${userData.photoURL}" alt="Avatar of the current user"/>
				<div class="font-semibold text:xl tracking-tight mr-4 inline-block px-4 py-2 leading-none text-white">
				${userData.displayName}
				</div>
			</div>
		</div>
		<div class="md:hidden flex items-center">
			<div class="block">
				<button class="flex items-center px-3 py-2 border rounded text-teal-200 border-gray-500 hover:text-white hover:border-white">
					<svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
				</button>
			</div>
			<img class="inline-block w-12 h-12 ml-2 rounded-full" src="${userData.photoURL}" alt="Avatar of the current user"/>
		</div>
	`;
};

const logout = () => {
	firebase
		.auth()
		.signOut()
		.then(() => {
			console.log("logout successful");
		})
		.catch((error) => {
			console.log("logout not successful");
		});
};
