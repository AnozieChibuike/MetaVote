function checkSession() {
    const session = sessionStorage.getItem("email"); // Or use localStorage

    if (!session) {
        window.location.href = "/"; // Redirect to home
    }
}

export default checkSession;