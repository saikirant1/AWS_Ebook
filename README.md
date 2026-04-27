# Ebook Landing

This repository contains the **eBook Landing** website. It’s a clean, modern landing page designed for promoting an eBook.  

---

## Features

- Responsive design — works well on mobile, tablet, and desktop  
- Clean, modern layout suited for marketing eBooks  
- Includes sections such as features, author info, download call-to-action  
- Built with HTML5 & CSS3  
- Lightweight & easy to customize  
- Cross-browser compatible  

---

## Structure

```

├── css/
│   └── templatemo-ebook-landing.css         ← main stylesheet
├── img/
│   └── …                                    ← images (author, cover, background, etc.)
├── js/
│   └── …                                    ← JavaScript if applicable (smooth scrolling, etc.)
├── index.html                              ← landing page
└── README.md                               ← this file

```

---

## Customization Instructions

1. **Update images** — replace the book cover, author photo, or any background images in the `img/` folder.  
2. **Modify text/content** — adjust headings, paragraph content, author bio, features, CTAs, etc., inside `index.html`.  
3. **Colors / styling** — you can update the CSS in `css/templatemo-ebook-landing.css` to change color scheme, fonts, spacing.  
4. **Fonts** — check in HTML where Google Fonts or other web fonts are imported; change as needed.  
5. **Deployment** — upload the files to your static host (GitHub Pages, Netlify, Vercel, etc.) or serve via your preferred web server.  

---

## Dependencies

This template is pure HTML & CSS, so it has no build steps or external dependencies.  
If you use any JS features, ensure your users’ browsers support them, or include fallbacks.  

---

## License & Attribution

- Template developed by **TemplateMo**.  
- Please keep the attribution or footer credit as required by the template license, unless you have a different license or rights.  
- Always review the **TemplateMo license** to understand permitted use.  

---

## Usage

1. Clone or download this repository.  
2. Customize the content and styling as described above.  
3. Test the site locally (open `index.html` in a browser).  
4. Deploy to your hosting solution.
5. [Reference URL](https://docs.google.com/document/d/1W4bzfHPAyh2t5sNZ-rSIhueb1V9G2jmOhhLT8nKcuDk/edit?tab=t.0#heading=h.8sny8y6vsrjw)

---

## Assignment – Contact Submissions Admin Page

### What was built

| Item | Details |
|------|---------|
| **GET Lambda** | `lambda-list/index.mjs` — reads from DynamoDB, supports `?limit=` & `?lastKey=` pagination, sorts by `createdAt` desc |
| **contacts.html** | Static admin page that fetches and displays all contact form submissions in a table |
| **API endpoint** | `GET https://ib5mu40ryb.execute-api.us-east-1.amazonaws.com/dev/epicreads_resource` |

---

### Steps taken

#### 1. IAM – Add DynamoDB read permission to Lambda role
Go to **IAM → Roles → your Lambda role → Add inline policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "dynamodb:Scan",
      "Resource": "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/ContactMessages"
    }
  ]
}
```

#### 2. API Gateway – Add GET method
- Go to **API Gateway → epicreads_resource**
- Create a new **GET** method pointing to the new Lambda (lambda-list)
- Enable **CORS** on the resource
- Enable CORS on **Gateway Responses → Default 4XX and 5XX**
- **Deploy** the API to the `dev` stage

#### 3. Lambda – Deploy the list function
- Create a new Lambda function (Node.js 20, ES module)
- Copy the code from `lambda-list/index.mjs`
- Set environment variable: `TABLE_NAME = ContactMessages`
- Attach the same role that has `dynamodb:Scan` permission

#### 4. contacts.html – Upload to S3
```bash
aws s3 cp contacts.html s3://epicreads-pravin/ --profile theepicbook
```

#### 5. Test
```bash
curl "https://ib5mu40ryb.execute-api.us-east-1.amazonaws.com/dev/epicreads_resource?limit=5"
```

---

### Known issues / notes
- The `contacts.html` API URL must be updated to the GET endpoint once created in API Gateway (currently points to the POST endpoint as placeholder).
- No authentication on the admin page — for production, protect it with Cognito or an API key.
- CloudFront is not configured in this project; the page is served directly from S3.
