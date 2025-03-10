let students = [];

function updateStudentList() {
    const list = document.getElementById('studentList');
    list.innerHTML = '';
    students.forEach((student, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${student.name} - ${student.code} - ${student.date} - ${student.address} - ${student.phone} - ${student.mobile} - ${student.email}`;
        list.appendChild(li);
    });
}

function exportData(format) {
    let data = '';
    if (format === 'json') {
        data = JSON.stringify(students, null, 2);
        downloadFile(data, 'students.json', 'application/json');
    } else if (format === 'txt') {
        data = students.map(s => Object.values(s).join(', ')).join('\n');
        downloadFile(data, 'students.txt', 'text/plain');
    } else if (format === 'xml') {
        data = '<?xml version="1.0" encoding="UTF-8"?>\n<students>' +
            students.map(s => `
  <student>
    <name>${s.name}</name>
    <code>${s.code}</code>
    <date>${s.date}</date>
    <address>${s.address}</address>
    <phone>${s.phone}</phone>
    <mobile>${s.mobile}</mobile>
    <email>${s.email}</email>
  </student>`).join('') + '\n</students>';
        downloadFile(data, 'students.xml', 'application/xml');
    } else if (format === 'csv') {
        data = 'Nombre,Código,Fecha,Dirección,Teléfono,Celular,Correo\n' +
            students.map(s => Object.values(s).join(',')).join('\n');
        downloadFile(data, 'students.csv', 'text/csv');
    }
}

function downloadFile(content, fileName, mimeType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importData() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const content = event.target.result;
        if (file.name.endsWith('.json')) {
            students = JSON.parse(content);
        } else if (file.name.endsWith('.txt')) {
            students = content.split('\n').map(line => {
                const [name, code, date, address, phone, mobile, email] = line.split(', ');
                return { name, code, date, address, phone, mobile, email };
            });
        } else if (file.name.endsWith('.xml')) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(content, 'text/xml');
            students = Array.from(xml.getElementsByTagName('student')).map(student => ({
                name: student.getElementsByTagName('name')[0].textContent,
                code: student.getElementsByTagName('code')[0].textContent,
                date: student.getElementsByTagName('date')[0].textContent,
                address: student.getElementsByTagName('address')[0].textContent,
                phone: student.getElementsByTagName('phone')[0].textContent,
                mobile: student.getElementsByTagName('mobile')[0].textContent,
                email: student.getElementsByTagName('email')[0].textContent
            }));
        } else if (file.name.endsWith('.csv')) {
            const lines = content.split('\n').slice(1);
            students = lines.map(line => {
                const [name, code, date, address, phone, mobile, email] = line.split(',');
                return { name, code, date, address, phone, mobile, email };
            });
        }
        updateStudentList();
    };
    reader.readAsText(file);
}

// VALIDACIONES
const fields = [
    { id: 'name', regex: /^[A-Za-z\s]+$/, message: 'Solo letras y espacios', minLength: 3 },
    { id: 'code', regex: /^[1-9][0-9]{7}$/, message: 'No puedes iniciar con 0 y debes ingresar 8 dígitos.', minLength: 8 },
    { id: 'date', regex: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, message: 'Fecha inválida (DD/MM/AAAA)', minLength: 10 },
    { id: 'address', regex: /^[A-Za-z0-9#\-\s]+$/, message: 'Dirección inválida', minLength: 5 },
    { id: 'phone', regex: /^6056[0-9]{6}$/, message: 'Debe iniciar con 6056 y tener 10 dígitos', minLength: 10 },
    { id: 'mobile', regex: /^3[0-9]{9}$/, message: 'Debe iniciar con 3 y tener 10 dígitos', minLength: 10 },
    { id: 'email', regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Correo electrónico inválido', minLength: 6 }
];

// Validación en tiempo real
fields.forEach(field => {
    const input = document.getElementById(field.id);
    const errorSpan = document.getElementById(`error-${field.id}`);

    input.addEventListener('input', () => {
        const value = input.value.trim();

        if (field.id === 'code' && value.startsWith('0')) {
            errorSpan.textContent = field.message;
            errorSpan.style.display = 'block';
            input.classList.add('error');
            errorSpan.classList.remove('show');
            void errorSpan.offsetWidth;
            errorSpan.classList.add('show');
            return;
        }

        if (value.length < field.minLength) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
            errorSpan.style.display = 'none';
            return;
        }

        if (field.regex.test(value)) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
            errorSpan.style.display = 'none';
            input.classList.remove('error');
        } else {
            errorSpan.textContent = field.message;
            errorSpan.style.display = 'block';
            input.classList.add('error');
            errorSpan.classList.remove('show');
            void errorSpan.offsetWidth;
            errorSpan.classList.add('show');
        }
    });

    input.addEventListener('blur', () => {
        const value = input.value.trim();
        if (!field.regex.test(value)) {
            errorSpan.textContent = field.message;
            errorSpan.style.display = 'block';
            errorSpan.classList.remove('show');
            void errorSpan.offsetWidth;
            errorSpan.classList.add('show');
        } else {
            input.classList.remove('error');
        }
    });
});

// VALIDACIÓN Y REGISTRO FINAL
document.getElementById('studentForm').addEventListener('submit', function (e) {
    e.preventDefault();
    let isValid = true;

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorSpan = document.getElementById(`error-${field.id}`);

        if (!field.regex.test(input.value.trim())) {
            errorSpan.textContent = field.message;
            errorSpan.style.display = 'block';
            errorSpan.classList.remove('show');
            void errorSpan.offsetWidth;
            errorSpan.classList.add('show');
            input.classList.add('error');
            isValid = false;
        }
    });

    if (isValid) {
        alert("Registrado Correctamente.");

        const student = {
            name: document.getElementById('name').value,
            code: document.getElementById('code').value,
            date: document.getElementById('date').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            mobile: document.getElementById('mobile').value,
            email: document.getElementById('email').value
        };

        students.push(student);
        updateStudentList();
        this.reset();

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const errorSpan = document.getElementById(`error-${field.id}`);
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
            input.classList.remove('error');
        });
    }
});
