const db = firebase.firestore();

const places = [];
const infoWindows = [];

db.collection("blogPosts")
	.get()
	.then((posts) => {
		posts.forEach((post) => {
			const json = post.data();
			const html = createPost(json, json.image.src);

			html.then((blogContent) => {
				const infowindow = new google.maps.InfoWindow({
					content: blogContent,
				});

				const marker = new google.maps.Marker({
					position: json.geo_data,
					map: map,
				});

				marker.addListener("click", () => {
					closeInfoWindows();
					infowindow.open(map, marker);
				});

				map.addListener("click", () => {
					closeInfoWindows();
				});

				places.push(marker);
				infoWindows.push(infowindow);
			});
		});
	});

var map;
function initMap() {
	const center = { lat: 48.13743, lng: 11.57549 };
	const mapDiv = document.getElementById("map");

	map = new google.maps.Map(mapDiv, {
		center: center,
		zoom: 5,
		// gestureHandling: "greedy"
	});
}

const closeInfoWindows = () => {
	for (let i = 0; i < infoWindows.length; i++) {
		const infoWindow = infoWindows[i];
		infoWindow.close();
	}
};

const getUrlObject = (fileName) => {
	const imageRef = firebase.storage().ref().child(`blogPics/${fileName}`);

	return imageRef.getDownloadURL();
};

const createPost = (json, fileName) => {
	return getUrlObject(fileName).then((url) => {
		return `
		<div class="container max-w-sm rounded overflow-hidden justify-center ml-1">
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
