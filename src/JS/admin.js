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
			<a href="../../src/auth/restricted.html" class="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white">
			Home
			</a>
			<button id="logout-btn" class="mx-3 inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white">
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
					<svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
						<title>
							Menu
						</title>
						<path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/>
					</svg>
				</button>
			</div>
			<img class="inline-block w-12 h-12 ml-2 rounded-full" src="${userData.photoURL}" alt="Avatar of the current user"/>
		</div>
	`;
};

const db = firebase.firestore();

const content = document.getElementById("blogListing");

db.collection("blogPosts")
	.get()
	.then((posts) => {
		posts.forEach((post) => {
			const json = post.data();
			const docId = post.id;
			const newDiv = document.createElement("div");
			const html = createPost(json, json.image.src, docId);

			html.then((blogContent) => {
				newDiv.classList.add("md:mr-4", "mb-4");
				newDiv.innerHTML = blogContent;
				content.append(newDiv);
			});
		});
	});

const logout = () => {
	firebase
		.auth()
		.signOut()
		.then(() => {
			window.location.href = "../../index.html";
			console.log("logout successful");
		})
		.catch((error) => {
			console.error("logout not successful");
		});
};

const getUrlObject = (fileName) => {
	const imageRef = firebase.storage().ref().child(`blogPics/${fileName}`);

	return imageRef.getDownloadURL();
};

const createPost = (json, fileName, docId) => {
	return getUrlObject(fileName).then((url) => {
		return `
		<div id="${docId}" class="relative container max-w-sm rounded overflow-hidden justify-center bg-white">
			<div class="absolute w-full h-full opacity-0 hover:opacity-100">
				<button onclick="updateBlogPost()" class="mt-1 mr-1 w-8 h-8 float-right">
					<img src="../../img/bleistift.png" title="Edit Blogpost" alt="Button zum Bearbeiten des Blogposts"/>
				</button>
			</div>
			<img class="w-full" src="${url}"/>
			<div class="px-6 py-4">
				<div class="font-bold text-xl mb-2">${json.title}</div>
				<p class=" block text-gray-700 text-base">${json.text}</p>
			</div>
			<div class="px-6 py-4 flex items-center">
				<img class="w-10 h-10 rounded-full mr-4" src="${
					json.author_image
				}" alt="Avatar of Christoph Pöllmann"/>
				<div class="text-sm">
					<p class="text-gray-900 leading-none">${json.author}</p>
					<p class="text-gray-600">${
						json.date.toDate ? json.date.toDate().toDateString() : json.date
					} in ${json.location.city}, ${json.location.country} </p>
				</div>
			</div>
		</div>`;
	});
};

const createNewBlogPost = (e) => {
	e.preventDefault();
	const form = document.getElementById("newBlogForm");
	const title = document.getElementById("title").value;
	const city = document.getElementById("city").value;
	const country = document.getElementById("country").value;
	const entry = document.getElementById("entry").value;
	const lat = parseFloat(document.getElementById("latitude").value);
	const lng = parseFloat(document.getElementById("longitude").value);
	const file = document.getElementById("uploadBtn").files[0];

	const date = new Date();

	const storageRef = firebase.storage().ref();
	const metadata = {
		contentType: file.type,
	};

	storageRef.child("blogPics/" + file.name).put(file, metadata);

	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			db.collection("blogPosts")
				.add({
					title: title,
					text: entry,
					date: date,
					image: { alt: "", src: file.name },
					geo_data: { lat: lat, lng: lng },
					location: { city: city, country: country },
					author: user.displayName,
					author_image: user.photoURL,
				})
				.then((docRef) => {
					console.log("Document written with ID: ", docRef.id);
				})
				.catch((error) => {
					console.error("Error adding document: ", error);
				});
		} else {
			window.location.href = "../../index.html";
		}
	});

	form.reset();
};

document
	.getElementById("newBlogForm")
	.addEventListener("submit", createNewBlogPost);

//Charcounter
const textEntry = document.getElementById("entry");
const charsCounterInfo = document.getElementById("charsCounter");
const MAX_CHARS = 120;
const submitBtn = document.getElementById("formSubmitBtn");

textEntry.addEventListener("input", () => {
	const countUpChars = textEntry.value.length;
	const textColor = countUpChars > MAX_CHARS ? "red" : null;

	charsCounterInfo.textContent = `${countUpChars}/120 characters`;
	charsCounterInfo.style.color = textColor;

	if (textColor == "red") {
		submitBtn.disabled = true;
		submitBtn.classList.add("opacity-50", "cursor-not-allowed");
	} else {
		submitBtn.disabled = false;
		submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
	}
});

const updateBlogPost = () => {
	const targetButton = document.activeElement.parentElement;
	const targetBlogPost = targetButton.parentElement;
	const targetId = targetBlogPost.id;
	const answer = confirm("Do you really want to edit this BlogPost? Press OK.");

	if (answer) {
		showEditForm(targetBlogPost, targetId);
	}
};

const showEditForm = (targetPost, targetId) => {
	db.collection("blogPosts")
		.doc(`${targetId}`)
		.get()
		.then((blogData) => {
			const oldValue = blogData.data();
			targetPost.innerHTML = `
					<form
						id="editBlogForm"
						class="rounded-lg w-full max-w-lg bg-gray-300 p-8"
						>
						<div class="flex flex-wrap justify-center -mx-3">
							<div class="w-full px-3 mb-6 md:mb-0">
								<label
									class="block uppercase tracking-wide text-teal-800 text-md font-bold mb-2"
									for="editTitle"
								>
									Title:
								</label>
								<input
									class="appearance-none block w-full bg-white text-gray-700 border rounded py-3 px-4 mb-8 leading-tight focus:outline-none focus:bg-white"
									id="editTitle"
									name="editTitle"
									value="${oldValue.title}"
									type="text"
									maxlength="35"
									placeholder="Edit the blog title"
									required
								/>
							</div>
							<div class="w-full px-3 mb-6 md:mb-0">
								<label
									class="block uppercase tracking-wide text-teal-800 text-md font-bold mb-2"
									for="editCity"
								>
									City:
								</label>
								<input
									class="appearance-none block w-full bg-white border rounded py-3 px-4 mb-8 leading-tight focus:outline-none focus:bg-white"
									id="editCity"
									name="editCity"
									value="${oldValue.location.city}"
									type="text"
									pattern="[a-zA-Z]*"
									title="Bitte geben Sie nur Buchstaben ein"
									placeholder="Please edit the city name"
									required
								/>
							</div>
							<div class="w-full px-3 mb-6 md:mb-0">
								<label
									class="block uppercase tracking-wide text-teal-800 text-md font-bold mb-2"
									for="editCountry"
								>
									Country:
								</label>
								<input
									class="appearance-none block w-full bg-white border rounded py-3 px-4 mb-8 leading-tight focus:outline-none focus:bg-white"
									id="editCountry"
									name="editCountry"
									value="${oldValue.location.country}"
									type="text"
									pattern="[a-zA-Z]*"
									title="Bitte geben Sie nur Buchstaben ein"
									placeholder="Please edit the country name"
									required
								/>
							</div>
							<div class="w-full px-3 mb-6 md:mb-0">
								<label
									class="block uppercase tracking-wide text-teal-800 text-md font-bold mb-2"
									for="editLatitude"
								>
									Latitude:
								</label>
								<input
									class="appearance-none block w-full bg-white border rounded py-3 px-4 mb-8 leading-tight focus:outline-none focus:bg-white"
									id="editLatitude"
									name="editLatitude"
									value="${oldValue.geo_data.lat}"
									type="text"
									placeholder="Please edit the countrys latitude"
									required
								/>
							</div>
							<div class="w-full px-3 mb-6 md:mb-0">
								<label
									class="block uppercase tracking-wide text-teal-800 text-md font-bold mb-2"
									for="editLongitude"
								>
									Longitude:
								</label>
								<input
									class="appearance-none block w-full bg-white border rounded py-3 px-4 mb-8 leading-tight focus:outline-none focus:bg-white"
									id="editLongitude"
									name="editLongitude"
									value="${oldValue.geo_data.lng}"
									type="text"
									placeholder="Please edit the countrys longitude"
									required
								/>
							</div>
							<div class="w-full px-3 mb-6 md:mb-0">
								<label
									class="block uppercase tracking-wide text-teal-800 text-md font-bold mb-2"
									for="editEntry"
								>
									Blog Entry:
								</label>
								<textarea
									class="appearance-none block w-full bg-white text-gray-700 border rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white"
									name="editEntry"
									id="editEntry"
									cols="30"
									rows="10"
									required
								>${oldValue.text}</textarea>
								<div id="charsCounter" class="mb-8">0/120 characters</div>
							</div>
							<button
								onclick="window.location.reload();"
								class="bg-red-600 shadow hover:bg-red-800 text-white font-bold py-3 mr-3 w-32 rounded-full"
								>
								Abbrechen
							</button>
							<button
								
								id="submitEditedPost"
								class="bg-teal-800 shadow hover:bg-teal-700 text-white font-bold py-3 ml-3 w-32 rounded-full"
							>
								Update
							</button>
						
						</div>
					</form>
		`;
		});
};

//UNDER CONSTRUCTION
// const uploadNewEntry = (id) => {
// 	// e.preventDefault();
// 	const form = document.getElementById("editBlogForm");
// 	const title = document.getElementById("editTitle").value;
// 	const city = document.getElementById("editCity").value;
// 	const country = document.getElementById("editCountry").value;
// 	const entry = document.getElementById("editEntry").value;
// 	const lat = parseFloat(document.getElementById("editLatitude").value);
// 	const lng = parseFloat(document.getElementById("editLongitude").value);

// 	db.collection("blogPosts")
// 		.doc(`${id}`)
// 		.update({
// 			title: title,
// 			text: entry,
// 			geo_data: { lat: lat, lng: lng },
// 			location: { city: city, country: country },
// 		});
// };
