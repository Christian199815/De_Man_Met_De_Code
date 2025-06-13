# Man met de Hamer

A portfolio website for "De Man met de Hamer". A maker of sets, props and decorations.
### Homepage
<img width="1000" alt="Homepage" src="https://github.com/user-attachments/assets/a41c0802-e17d-4584-8445-d8b01810715f" />

### Product page
<img width="1000" alt="Product page" src="https://github.com/user-attachments/assets/05deb2e5-3e90-49e4-bf31-01c14ffdbb85" />

### About page
<img width="1000" alt="About page" src="https://github.com/user-attachments/assets/04490aad-7d64-4790-8d4b-17a586bda08a" />

## Table of Contents

- Installation
- Usage
- Tackstack
- License
- Contact

## Installation

Clone the repository:

```
git clone https://github.com/Christian199815/De_Man_Met_De_Code
cd repository
npm install
npm run dev

---
```

## Usage

Start the server and open `http://localhost:3000` in your browser.

## Creating your own projects

### Prepr setup
For displaying your own projects in the website you would have to make an account at prepr.
When you have made your account and setup your environment you can create your schema's.
The images below show what the types of input are and what names they should have for the code in the web app to find them.
There are 2 schema's you would have to make, the project is for the horizontal and vertical cards, the square item is for the small filler blocks.

<img width="500" alt="project item prepr sided" src="https://github.com/user-attachments/assets/d4ecbfd9-7759-4ac2-8c53-8a224aae4f6f" />
<img width="500" alt="square item prepr sided" src="https://github.com/user-attachments/assets/e1ce77b4-cb14-4578-af0b-236636b55c8f" />


### Add the Api key

Under settings in the backend of prepr you have the Acces Tokens page.
Here you would need to create the tokens which would we need to implement in the code project for all the calls to be able to connect.
In your project create an .env file and add the variables down below, make sure you edit the PREPR_TOKEN & PREPR_API_URL with your own data.

```
PREPR_TOKEN=[your prepr token]
PREPR_API_URL=[your prepr url]

# Server Configuration
PORT=[port you want to use]
```

### Prepr API Explorer

In the prepr backend under where you have found the accestokens is a link to the API Explorer.
After creating the project and square item schema's double check with the API Explorer if you have selected the right names and types!



```
const PROJECTS_QUERY = `
query GetProjects {
    Projects (limit: 1000)  {
        items {
            _id
            _slug
            project_title
            production_name
            featured_image {
                url
                height
                width
            }
            photographer_name
            project_date
            for_sale
            categorie
            full_content {
                url
            }
        }
    }
}
`;
```

```
const ITEMS_QUERY = `
query GetItems {
    SquareItems {
        items {
            _id
            item_name
            item_image {
                url
            }
        }
    }
}
`;
```


## Features

- 🖱️ Interact with the projects
- 🔎 Search and filter the projects
- 🔄 Add files with Prepr

## Techstack

- Liquid
- TinyHTTP
- HTML | CSS | JS
- Github
- GSAP
- AI
- Figma
- PREPR

## License

This project is licensed under the Apache License. See the [License](http://www.apache.org/licenses/) site for details.

## Contact

Created by De Man Met De Code – feel free to reach out!
