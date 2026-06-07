import el from '@elements';

export default function links() {
    if (el.title) el.title.innerText = "Lord Steve's Links";
    if (el.nav) el.nav.style.display = "none";
}