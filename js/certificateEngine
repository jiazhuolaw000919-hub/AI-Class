// ================================================================
// ENGINE: CertificateEngine
// LAYER: Core Logic Layer
// DOMAIN: Certificate Generation & Management
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Generates and manages certificates for completed courses,
//   schools, and professional certifications.
//
// PUBLIC API
// ================================================================
//   init()                              -> void
//   generateCertificate(params)         -> Certificate object
//   getCertificate(id)                  -> Certificate object
//   getAllCertificates()                -> array
//   verifyCertificate(id)               -> boolean
//   exportCertificate(id, format)       -> string
//   getStatus()                         -> Status object
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (required) : For persistent storage
//   - EventBus (optional)     : For emitting events
//
// STORAGE
// ================================================================
//   - Key: 'lawai_certificates'
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'CertificateGenerated' : When a certificate is generated
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CertificateEngine = {
    _engineName: 'CertificateEngine',
    _engineVersion: '1.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'Core Logic Layer',
    _domain: 'Certificate Generation & Management',

    _initialized: false,
    _certificates: [],

    // ============================================================
    // PUBLIC API
    // ============================================================

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        this._certificates = this._safeGet('certificates', []);
        console.log('📜 CertificateEngine initialized with', this._certificates.length, 'certificates');
    },

    generateCertificate: function(params) {
        if (!params || !params.title) {
            console.warn('⚠️ Invalid certificate parameters');
            return null;
        }

        var certificate = {
            id: 'cert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            title: params.title,
            description: params.description || 'Completion Certificate',
            schoolId: params.schoolId || 'school-ai',
            type: params.type || 'course', // 'course' | 'school' | 'professional'
            level: params.level || 'Beginner',
            issuedTo: params.issuedTo || 'Learner',
            issuedDate: new Date().toISOString(),
            expiresDate: params.expiresDate || null,
            courseIds: params.courseIds || [],
            badge: params.badge || '🏆',
            verificationCode: 'V' + Math.random().toString(36).toUpperCase().substr(2, 8),
            metadata: params.metadata || {}
        };

        this._certificates.push(certificate);
        this._save();

        LawAIApp.EventBus?.emit?.('CertificateGenerated', { certificate: certificate });
        console.log('📜 Certificate generated:', certificate.title);

        return certificate;
    },

    getCertificate: function(id) {
        return this._certificates.find(function(c) { return c.id === id; }) || null;
    },

    getAllCertificates: function() {
        return this._certificates.slice();
    },

    verifyCertificate: function(id) {
        var cert = this.getCertificate(id);
        if (!cert) return false;

        // 检查是否过期
        if (cert.expiresDate && new Date(cert.expiresDate) < new Date()) {
            return false;
        }
        return true;
    },

    exportCertificate: function(id, format) {
        var cert = this.getCertificate(id);
        if (!cert) return null;

        format = format || 'text';

        if (format === 'text') {
            return '========================\n' +
                   'LAW AI ACADEMY\n' +
                   '========================\n' +
                   'Certificate of Completion\n' +
                   '------------------------\n' +
                   cert.title + '\n' +
                   cert.description + '\n' +
                   '------------------------\n' +
                   'Issued to: ' + cert.issuedTo + '\n' +
                   'Date: ' + new Date(cert.issuedDate).toLocaleDateString() + '\n' +
                   'School: ' + cert.schoolId + '\n' +
                   'Verification: ' + cert.verificationCode + '\n' +
                   '========================\n';
        }

        if (format === 'json') {
            return JSON.stringify(cert, null, 2);
        }

        return null;
    },

    getStatus: function() {
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            initialized: this._initialized,
            totalCertificates: this._certificates.length,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    },

    // ============================================================
    // PRIVATE
    // ============================================================

    _save: function() {
        this._safeSet('certificates', this._certificates);
    },

    _safeGet: function(key, defaultValue) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(key, defaultValue);
            }
            var val = localStorage.getItem('lawai_' + key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    _safeSet: function(key, value) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(key, value);
                return true;
            }
            localStorage.setItem('lawai_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }
};

setTimeout(function() { LawAIApp.CertificateEngine.init(); }, 300);
console.log('📜 CertificateEngine loaded');
