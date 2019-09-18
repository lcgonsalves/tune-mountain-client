import React from 'react';
import '../css/UserProfile.css';

const UserProfile = (props) => {
	const {
		accessToken,
		refreshToken,
		country,
		displayName,
		email,
		id,
		uri,
		profilePictureUrl
	} = props;

	return (

		<div className="user-profile">
			<img src={profilePictureUrl} alt={null}/>
			<h3>DisplayName: {displayName}</h3>
			<h4>Country: {country}</h4>
			<p>Email: {email}</p>
			<p>ID: {id}</p>
			<p>URI: {uri}</p>
			<p>AccessToken: {accessToken}</p>
			<p>RefreshToken: {refreshToken}</p>
		</div>

	);
};

export default UserProfile;
