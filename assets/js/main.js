// Mobile nav toggle
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  links.classList.toggle('open');
  toggle.classList.toggle('open');
});

// Close mobile nav on link click
links.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
  });
});

// Close mobile nav on outside click
document.addEventListener('click', (e) => {
  if (links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)) {
    links.classList.remove('open');
    toggle.classList.remove('open');
  }
});

// Navbar background on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});
