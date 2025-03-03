let students = [];

document.getElementById('studentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
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
});

function updateStudentList() {
    const list = document.getElementById('studentList');
    list.innerHTML = '';
    students.forEach((student, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${student.name} - ${student.code} - ${student.date} - ${student.address} - ${student.phone} - ${student.mobile} - ${student.email}`;
        list.appendChild(li);
    });
}

function exportData() {
    const data = JSON.stringify(students, null, 2);
    downloadFile(data, 'students.json', 'application/json');
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
    reader.onload = function(event) {
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
