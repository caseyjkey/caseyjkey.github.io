import React, { lazy } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import { Heading } from './style.js' // Global styled-components
import { Container, Row, Col } from 'reactstrap'
import { ProjectSection } from './Projects/style.js'
import Project from './Projects/Project'


export const Projects = (props) => {
	const data = useStaticQuery( 
		graphql`
			query {
				allProjectsJson(sort: { order: DESC, fields: [date] }) {
					edges {
						node {
							id
							image {
								childImageSharp {
									fluid(maxWidth: 605) {
										...GatsbyImageSharpFluid
									}
								}
							}
							title
							subtitle
							description
							icons
							date
							imageFolder
							videos
							link
						}
					}
				}
			}
		`
	);

	// Get components for icons specified in projects.json
	function loadIcons(iconArray) {
		Icons = [];
		iconArray.map(type => (
			iconArray[type].map( icon => {
				let iconPack = 'react-icons/';
				if (type === "fa")
					iconPack += "fa";
				else if (type === "io")
					iconPack += "io";
				else if (type === "di")
					iconPack += "di";
				const Icon = lazy(() => 
					import(iconPack).then(module => ({ default: module.Components[icon]}))
				);
				Icons.push(Icon);
			})
		));
		return Icons;
	}

	return (
		<ProjectSection name="Projects">
			<Container fluid={true} className="">
				<Row noGutters className="justify-content-center pb-5">
					<Col md={12} className="heading-section text-center ">
						<Heading className="mb-4">My Projects</Heading>
						<p>I find the best way to learn is by practice. Here is the result of my work.</p>
					</Col>
				</Row>
				<Row>
					{data.allProjectsJson.edges.map(project =>  (
						<Col md={4} className="pb-4">
							<Project image={<Img fluid={project.node.image.childImageSharp.fluid} />}
											 title={project.node.title}
											 subtitle={project.node.subtitle}
											 icons={loadIcons(project.node.icons)}
											 date={project.node.date}
							>
								{project.node.description};
							</Project>
						</Col>
					))}
				</Row>
			</Container>
		</ProjectSection>
	);
} 