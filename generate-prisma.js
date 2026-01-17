const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const schemas = [
    'prisma/schema-security.prisma',
    'prisma/schema-academic.prisma',
    'prisma/schema-help.prisma'
];

schemas.forEach(schema => {
    console.log(`Generating client for ${schema}...`);
    try {
        const output = execSync(`npx prisma generate --schema=${schema}`, {
            stdio: 'inherit',
            env: { ...process.env, DATABASE_SECURITY_URL: "postgresql://postgres:josuealban4657@localhost:5432/university_security?schema=public", DATABASE_ACADEMIC_URL: "postgresql://postgres:josuealban4657@localhost:5432/university_academic?schema=public", DATABASE_HELP_URL: "postgresql://postgres:josuealban4657@localhost:5432/university_help?schema=public" }
        });
    } catch (error) {
        console.error(`Failed to generate client for ${schema}`);
    }
});
