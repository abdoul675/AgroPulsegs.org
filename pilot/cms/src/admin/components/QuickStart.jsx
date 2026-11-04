import React from 'react';
import {useIntl} from 'react-intl';
import './editor.css';
export default function QuickStart(){const {locale}=useIntl();const en=locale.startsWith('en');return <div className="agp-quick"><h3>{en?'Your website, made simple.':'Votre site, simplement.'}</h3><p>{en?'Choose a page, edit its text and arrange the blocks in a visual preview. Save a draft before publishing.':'Choisissez une page, modifiez ses textes et organisez les blocs dans un aperçu visuel. Enregistrez un brouillon avant publication.'}</p><a href="/admin/plugins/agropulse-editor">{en?'Open visual editor':'Ouvrir le pilotage visuel'}</a></div>;}
