/**
 * data.js — Contenido por defecto del CV (fuente única de verdad).
 *
 * Para publicar cambios hechos en admin.html para TODOS los visitantes:
 *   admin.html → "Descargar data.js" → reemplaza este archivo en el servidor.
 * Cada campo traducible es un objeto { es, en }.
 */
window.CV_DEFAULT_DATA = {
  "version": 2,
  "updatedAt": "2026-09-21T00:00:00.000Z",
  "personal": {
    "nombre": "Víctor Manuel Estrada Funes",
    "titulo": {
      "es": "Licenciado en Tecnología y Administración de las Telecomunicaciones",
      "en": "Bachelor's Degree in Telecommunications Technology and Administration"
    },
    "colegiado": "36479",
    "telefono": "(502) 5694-2222",
    "correo": "vmef1980@gmail.com",
    "ubicacion": { "es": "Ciudad de Guatemala, Guatemala", "en": "Guatemala City, Guatemala" },
    "linkedin": "https://www.linkedin.com/in/estradafunes/",
    "credly": "https://www.credly.com/users/victor-estrada.2114d8cf",
    "foto": "img/perfil.jpg",
    "favicon": "img/perfil.ico",
    "mensajeWhatsApp": {
      "es": "¡Hola, Víctor! Me interesa obtener más información sobre tus servicios de consultoría e infraestructura tecnológica.",
      "en": "Hi Víctor! I'd like more information about your IT infrastructure consulting services."
    }
  },
  "perfil": {
    "es": "Profesional y líder técnico con más de 25 años de trayectoria sólida en la administración de infraestructura tecnológica crítica, gestión de centros de datos, continuidad operativa y automatización de procesos en entornos bancarios y corporativos multinacionales. Especialista en diseñar e implementar soluciones de alta disponibilidad, migraciones complejas, planes de recuperación ante desastres (DRP) y optimización de costos, con una visión estratégica alineada al negocio.",
    "en": "IT professional and technical leader with over 25 years of solid experience managing critical technology infrastructure, data centers, business continuity and process automation in multinational banking and corporate environments. Specialist in designing and implementing high-availability solutions, complex migrations, disaster recovery plans (DRP) and cost optimization, with a strategic, business-aligned vision."
  },
  "servicios": [
    {
      "titulo": { "es": "Diseño y auditoría de centros de datos", "en": "Data Center Design & Auditing" },
      "descripcion": {
        "es": "Consultoría estratégica en arquitectura de centros de datos principales y de contingencia, garantizando la máxima continuidad operativa y mitigando la obsolescencia tecnológica.",
        "en": "Strategic consulting on primary and contingency data center architecture, ensuring maximum operational continuity and mitigating technology obsolescence."
      }
    },
    {
      "titulo": { "es": "Planes de continuidad y DRP", "en": "Business Continuity & DRP" },
      "descripcion": {
        "es": "Desarrollo e implementación integral de planes de recuperación ante desastres para entornos bancarios y corporativos de misión crítica.",
        "en": "End-to-end development and implementation of disaster recovery plans for mission-critical banking and corporate environments."
      }
    },
    {
      "titulo": { "es": "Automatización de procesos de TI", "en": "IT Process Automation" },
      "descripcion": {
        "es": "Optimización de flujos operativos y reducción de costos de TI mediante infraestructura programable y scripting avanzado.",
        "en": "Optimization of operational workflows and IT cost reduction through programmable infrastructure and advanced scripting."
      }
    }
  ],
  "experiencia": [
    {
      "cargo": { "es": "Ingeniero Sénior de Infraestructura", "en": "Senior Infrastructure Engineer" },
      "empresa": "Conduent Business de Guatemala, S.A.",
      "nota": { "es": "(antes Xerox de Guatemala, S.A.)", "en": "(formerly Xerox de Guatemala, S.A.)" },
      "periodo": { "es": "2013 – Actualidad", "en": "2013 – Present" },
      "logros": {
        "es": [
          "Administración integral y soporte global de centros de datos locales y remotos, asegurando la continuidad operativa en entornos críticos.",
          "Liderazgo de proyectos globales de infraestructura, migraciones de sistemas complejos y esquemas de seguridad informática.",
          "Automatización de procesos operativos, manteniendo alta estabilidad ante múltiples transiciones corporativas."
        ],
        "en": [
          "Comprehensive management and global support of local and remote data centers, ensuring operational continuity in critical environments.",
          "Leadership of global infrastructure projects, complex system migrations and information security frameworks.",
          "Automation of operational processes, maintaining high stability through multiple corporate transitions."
        ]
      }
    },
    {
      "cargo": { "es": "Director de Administración de Sistemas de Información", "en": "Director of Information Systems Administration" },
      "empresa": "Banco G&T Continental",
      "nota": { "es": "— El Salvador", "en": "— El Salvador" },
      "periodo": { "es": "2011 – 2013", "en": "2011 – 2013" },
      "logros": {
        "es": [
          "Gestión integral de centros de datos principales y de contingencia para el resguardo de la continuidad bancaria.",
          "Traslado físico exitoso del centro de datos principal con cero interrupciones en servicios críticos del negocio.",
          "Diseño de políticas de modernización tecnológica e implementación de soluciones redundantes de alta disponibilidad."
        ],
        "en": [
          "Comprehensive management of primary and contingency data centers to safeguard banking continuity.",
          "Successful physical relocation of the primary data center with zero interruptions to business-critical services.",
          "Design of technology modernization policies and implementation of redundant high-availability solutions."
        ]
      }
    },
    {
      "cargo": { "es": "Jefe de Administración de TI", "en": "Head of IT Administration" },
      "empresa": "Banco G&T Continental",
      "nota": { "es": "— Guatemala", "en": "— Guatemala" },
      "periodo": { "es": "2007 – 2011", "en": "2007 – 2011" },
      "logros": {
        "es": [
          "Coordinación de infraestructura crítica, liderando equipos en mantenimiento preventivo, monitoreo y soporte de nivel corporativo.",
          "Elaboración y ejecución de presupuestos de inversión alineados a planes de recuperación ante desastres (DRP)."
        ],
        "en": [
          "Coordination of critical infrastructure, leading teams in preventive maintenance, monitoring and enterprise-level support.",
          "Preparation and execution of investment budgets aligned with disaster recovery plans (DRP)."
        ]
      }
    }
  ],
  "habilidades": [
    {
      "titulo": { "es": "Computación en la nube", "en": "Cloud Computing" },
      "tags": {
        "es": "Microsoft Azure (IaaS, PaaS), Azure Virtual Machines, Azure Resource Manager (ARM), migraciones a la nube, virtualización empresarial (VMware vSphere, Hyper-V).",
        "en": "Microsoft Azure (IaaS, PaaS), Azure Virtual Machines, Azure Resource Manager (ARM), cloud migrations, enterprise virtualization (VMware vSphere, Hyper-V)."
      }
    },
    {
      "titulo": { "es": "Ciberseguridad y redes", "en": "Cybersecurity & Networking" },
      "tags": {
        "es": "Seguridad perimetral, Cisco PIX/ASA, SonicWall, firewalls de nueva generación (NGFW), VPN avanzadas, F5 BIG-IP, FortiMail, enrutamiento y conmutación corporativa (Cisco R&S).",
        "en": "Perimeter security, Cisco PIX/ASA, SonicWall, next-generation firewalls (NGFW), advanced VPNs, F5 BIG-IP, FortiMail, enterprise routing & switching (Cisco R&S)."
      }
    },
    {
      "titulo": { "es": "Infraestructura y servidores", "en": "Infrastructure & Servers" },
      "tags": {
        "es": "Servidores de misión crítica (HP/Compaq Blade, Dell PowerEdge), Windows Server, Active Directory empresarial, Microsoft Exchange, Unix, Ubuntu, almacenamiento NAS/SAN (HP EVA, EMC, Dell EqualLogic), HP Data Protector.",
        "en": "Mission-critical servers (HP/Compaq Blade, Dell PowerEdge), Windows Server, enterprise Active Directory, Microsoft Exchange, Unix, Ubuntu, NAS/SAN storage (HP EVA, EMC, Dell EqualLogic), HP Data Protector."
      }
    },
    {
      "titulo": { "es": "Automatización y DevOps", "en": "Automation & DevOps" },
      "tags": {
        "es": "Scripting avanzado en PowerShell, automatización de procesos (Excel VBA), infraestructura como código (IaC), programación de sistemas físicos (G-code).",
        "en": "Advanced PowerShell scripting, process automation (Excel VBA), Infrastructure as Code (IaC), physical systems programming (G-code)."
      }
    }
  ],
  "certificaciones": [
    {
      "nombre": { "es": "Programa Especializado en Desarrollo de Aplicaciones Móviles (ITEC)", "en": "Specialised Programme on Mobile App Development (ITEC)" },
      "emisor": { "es": "C-DAC — Noida, India", "en": "C-DAC — Noida, India" },
      "anio": "2026",
      "estilo": "destacada",
      "verificacionId": "2025GTM000095",
      "verificacionUrl": "https://itecgoi.in/certificate-verification"
    },
    {
      "nombre": { "es": "ISC2 Candidate", "en": "ISC2 Candidate" },
      "emisor": { "es": "ISC2 — Ruta profesional en ciberseguridad", "en": "ISC2 — Cybersecurity Professional Pathway" },
      "anio": "2026", "estilo": "verde", "verificacionId": "", "verificacionUrl": ""
    },
    {
      "nombre": { "es": "Cisco Certified DevNet Associate", "en": "Cisco Certified DevNet Associate" },
      "emisor": { "es": "Cisco Networking Academy — APIs, Linux y automatización de infraestructura", "en": "Cisco Networking Academy — APIs, Linux & Infrastructure Automation" },
      "anio": "2025", "estilo": "azul", "verificacionId": "", "verificacionUrl": ""
    },
    {
      "nombre": { "es": "Network Technician Career Path", "en": "Network Technician Career Path" },
      "emisor": { "es": "Cisco Networking Academy — Soporte y diagnóstico empresarial", "en": "Cisco Networking Academy — Enterprise Support & Diagnostics" },
      "anio": "2025", "estilo": "normal", "verificacionId": "", "verificacionUrl": ""
    },
    {
      "nombre": { "es": "Python Essentials 1", "en": "Python Essentials 1" },
      "emisor": { "es": "OpenEDG Python Institute / Cisco Networking Academy", "en": "OpenEDG Python Institute / Cisco Networking Academy" },
      "anio": "2023", "estilo": "normal", "verificacionId": "", "verificacionUrl": ""
    },
    {
      "nombre": { "es": "Microsoft Certified: Azure Fundamentals (AZ-900)", "en": "Microsoft Certified: Azure Fundamentals (AZ-900)" },
      "emisor": { "es": "Microsoft — Certificación en la nube, evaluada por ACE", "en": "Microsoft — Cloud Certification, ACE Reviewed" },
      "anio": "2022", "estilo": "normal", "verificacionId": "", "verificacionUrl": ""
    },
    {
      "nombre": { "es": "CCNA: Enterprise Networking, Security, and Automation", "en": "CCNA: Enterprise Networking, Security, and Automation" },
      "emisor": { "es": "Cisco — Enrutamiento y conmutación, nivel avanzado", "en": "Cisco — Routing & Switching, Advanced Level" },
      "anio": "2020", "estilo": "normal", "verificacionId": "", "verificacionUrl": ""
    },
    {
      "nombre": { "es": "CCNA: Switching, Routing, and Wireless Essentials", "en": "CCNA: Switching, Routing, and Wireless Essentials" },
      "emisor": { "es": "Cisco — Enrutamiento y conmutación, nivel intermedio", "en": "Cisco — Routing & Switching, Intermediate Level" },
      "anio": "2020", "estilo": "normal", "verificacionId": "", "verificacionUrl": ""
    },
    {
      "nombre": { "es": "CCNA: Introduction to Networks", "en": "CCNA: Introduction to Networks" },
      "emisor": { "es": "Cisco — Enrutamiento y conmutación, nivel básico", "en": "Cisco — Routing & Switching, Base Level" },
      "anio": "2020", "estilo": "normal", "verificacionId": "", "verificacionUrl": ""
    }
  ]
};
